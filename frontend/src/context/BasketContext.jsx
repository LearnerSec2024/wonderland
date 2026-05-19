import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const BASKET_STORAGE_KEY = "wonderland_basket";
export const BASKET_CLEARED_EVENT = "wonderland:basket-cleared";

const BasketContext = createContext(null);

function readStoredBasket() {
  try {
    const stored = localStorage.getItem(BASKET_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearStoredBasket() {
  try {
    localStorage.removeItem(BASKET_STORAGE_KEY);
    window.dispatchEvent(new Event(BASKET_CLEARED_EVENT));
  } catch {
    // Ignore localStorage/window errors so auth flows are never blocked by basket cleanup.
  }
}

function makeBasketId(itemType, itemId) {
  return `${itemType}-${itemId}`;
}

export function calculateAccommodationPricing(item) {
  const basePrice = Number(item.unitPrice || 0);
  const guestCount = Number(item.guestCount || 1);
  const guestSurchargeRates = [0.5, 0.25, 0.25, 0.1];

  const surcharge = guestSurchargeRates.reduce((total, rate, index) => {
    const guestNumber = index + 1;

    if (guestCount >= guestNumber) {
      return total + basePrice * rate;
    }

    return total;
  }, 0);

  return {
    basePrice,
    surcharge,
    subtotal: basePrice + surcharge,
  };
}

export function calculateBasketItemSubtotal(item) {
  if (item.itemType === "ride") {
    return Number(item.unitPrice || 0) * Number(item.quantity || 1);
  }

  return calculateAccommodationPricing(item).subtotal;
}

export function BasketProvider({ children }) {
  const [items, setItems] = useState(() => readStoredBasket());

  useEffect(() => {
    localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const handleBasketCleared = () => {
      setItems([]);
    };

    window.addEventListener(BASKET_CLEARED_EVENT, handleBasketCleared);

    return () => {
      window.removeEventListener(BASKET_CLEARED_EVENT, handleBasketCleared);
    };
  }, []);

  const addRide = (ride) => {
    setItems((current) => {
      const basketId = makeBasketId("ride", ride.RideId);
      const existing = current.find((item) => item.id === basketId);

      if (existing) {
        return current.map((item) =>
          item.id === basketId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          id: basketId,
          itemType: "ride",
          itemId: ride.RideId,
          name: ride.Name,
          description: ride.Description,
          unitPrice: Number(ride.Price),
          quantity: 1,
          pointsEarned: Number(ride.PointsEarned || 0),
          minimumAgeYears: Number(ride.MinimumAgeYears || 0),
          minimumHeightCm: Number(ride.MinimumHeightCm || 0),
        },
      ];
    });
  };

  const addAccommodation = (accommodation) => {
    setItems((current) => {
      const basketId = makeBasketId("accommodation", accommodation.AccommodationId);
      const existing = current.find((item) => item.id === basketId);

      if (existing) {
        return current;
      }

      return [
        ...current,
        {
          id: basketId,
          itemType: "accommodation",
          itemId: accommodation.AccommodationId,
          name: accommodation.Name,
          description: accommodation.Description,
          unitPrice: Number(accommodation.PricePerNight),
          guestCount: 1,
          maxGuests: Number(accommodation.MaxGuests || 1),
          minimumLeadGuestAgeYears: Number(
            accommodation.MinimumLeadGuestAgeYears || 18
          ),
        },
      ];
    });
  };

  const updateRideQuantity = (itemId, quantity) => {
    const safeQuantity = Math.max(1, Number(quantity || 1));

    setItems((current) =>
      current.map((item) =>
        item.itemType === "ride" && item.itemId === itemId
          ? { ...item, quantity: safeQuantity }
          : item
      )
    );
  };

  const updateAccommodationGuests = (itemId, guestCount) => {
    setItems((current) =>
      current.map((item) => {
        if (item.itemType !== "accommodation" || item.itemId !== itemId) {
          return item;
        }

        const safeGuests = Math.min(
          item.maxGuests,
          Math.max(1, Number(guestCount || 1))
        );

        return { ...item, guestCount: safeGuests };
      })
    );
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const clearBasket = () => {
    setItems([]);
  };

  const basketCount = useMemo(() => {
    return items.reduce((total, item) => {
      if (item.itemType === "ride") return total + item.quantity;
      return total + 1;
    }, 0);
  }, [items]);

  const basketTotal = useMemo(() => {
    return items.reduce((total, item) => {
      return total + calculateBasketItemSubtotal(item);
    }, 0);
  }, [items]);

  const totalPoints = useMemo(() => {
    return items.reduce((total, item) => {
      if (item.itemType === "ride") {
        return total + item.pointsEarned * item.quantity;
      }

      return total;
    }, 0);
  }, [items]);

  const value = {
    items,
    basketCount,
    basketTotal,
    totalPoints,
    addRide,
    addAccommodation,
    updateRideQuantity,
    updateAccommodationGuests,
    removeItem,
    clearBasket,
  };

  return (
    <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);

  if (!context) {
    throw new Error("useBasket must be used inside BasketProvider");
  }

  return context;
}