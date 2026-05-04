# Wonderland Playwright Training Requirements

Wonderland is not only a theme park booking app. It is also intended to become a realistic Playwright JavaScript training application.

The app must include normal modern UI features as well as intentionally difficult locator scenarios that mimic real-world enterprise systems.

---

## 1. Basic UI Features

The app should include:

- Navigation bar with multiple pages
- Login form
- Registration form
- Contact form
- Text inputs
- Dropdowns
- Radio buttons
- Checkboxes
- File upload
- Tables with sorting
- Tables with pagination
- Buttons with disabled states
- Buttons with loading states
- Search and filter bars

---

## 2. Theme Park Booking / E-Commerce Style Features

Although Wonderland is a theme park app, it should include e-commerce-style flows for automation training.

Features should include:

- Ride listing page
- Ride details page
- Accommodation listing page
- Accommodation details page
- Add ride/accommodation to booking basket
- Update quantity or guest count
- Remove booking item
- Checkout-style booking flow
- Booking confirmation page
- Reviews section

---

## 3. Authentication and Authorization

The app should include:

- JWT login
- Registration
- Protected routes
- Role-based access
- User role
- Admin role
- Logout
- Redirects when unauthenticated users try to access protected pages

---

## 4. API Endpoints

The backend should support both UI testing and API testing.

Planned API areas:

- User APIs
- Ride APIs
- Accommodation APIs
- Booking basket/cart APIs
- Booking/order APIs
- Reviews APIs
- Admin CRUD APIs

The APIs should include:

- Successful responses
- Validation errors
- 400 responses
- 401 responses
- 403 responses
- 404 responses
- 500-style error scenarios for testing

---

## 5. State and Async Behaviour

The UI should include:

- Loading spinners
- Skeleton loaders
- Toast notifications
- Modals
- Animations
- Delayed rendering
- API-driven rendering
- Disabled buttons during submission

---

## 6. Advanced Features

Later features should include:

- File upload
- File download
- Infinite scroll
- WebSocket-style live updates
- Multi-step forms
- Charts
- Admin dashboard

---

## 7. Testability Requirements

Normal production-style pages should include:

- Stable data-testid attributes
- Predictable DOM structure
- Accessible labels where appropriate
- Mockable APIs
- Multi-environment support

The app should support local development and future CI execution.

---

# 8. Tricky Locator Scenarios

The app must include a dedicated Automation Lab section with intentionally difficult elements.

These scenarios are required for teaching real-world Playwright automation techniques.

---

## A. Dynamic or Unstable Attributes

Include elements with:

- Randomized IDs
- Auto-generated-looking classes
- Changing DOM positions
- React lists where ordering can change

Example:

```html
<button id="btn_83921" class="xYz-abc-99">Book Now</button>
B. Deeply Nested DOM Structures

Include:

5 to 10 nested div layers
Legacy-style table layouts
Nested forms inside modals
Forms inside tabs
Modals inside tabs
C. Shadow DOM Elements

Include at least 2 to 3 Shadow DOM components.

Examples:

Custom dropdown
Custom date picker
Custom toggle switch
D. Iframes

Include:

One iframe containing a form
One iframe containing a button
One iframe containing a table
Optional nested iframe inside another iframe
E. Elements Without IDs or Names

Include:

Buttons with only text
Inputs with no labels
Icons with no accessible name
Elements that require nth-child, nth-of-type, or text-based selectors
F. Overlapping or Hidden Elements

Include:

Button partially covered by another element
Dropdown visible only on hover
Modal that blocks background clicks
G. Legacy jQuery-Style UI

Include a legacy training page where:

Elements are updated using direct DOM manipulation
Click handlers are attached outside React state
DOM mutates without normal React re-rendering

This can be implemented with plain JavaScript rather than actual jQuery if preferred.

H. Slow or Delayed Rendering

Include elements that appear after:

1 second delay
2 second delay
3 second delay
API response
Animation completion
I. Reused Components with Identical Text

Include:

Multiple Edit buttons
Multiple Delete buttons
Multiple identical rows
Multiple cards with same button text
J. Elements That Require XPath

Include non-semantic markup such as:

<table>
  <tr>
    <td>
      <span>
        <b>Click Me</b>
      </span>
    </td>
  </tr>
</table>

This is for teaching XPath and difficult DOM traversal.

K. Hover-Only Menus

Include:

Dropdowns that appear only on hover
Submenus inside hover menus
L. Drag and Drop

Include:

Legacy HTML5 drag events
Reordering list items
Dragging cards between columns
Implementation Approach

Wonderland should have two types of pages:

Clean modern app pages for realistic user workflows
Automation Lab pages that intentionally include difficult test scenarios

This allows students to learn both good automation practices and real-world troubleshooting techniques.
