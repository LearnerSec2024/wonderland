import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return "Not set";

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassed) age -= 1;

  return age;
}

function formatDate(value) {
  if (!value) return "Not set";

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProfilePage() {
  const { token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const result = await api.getProfile(token);
        setProfile(result.profile);
      } catch (error) {
        setLoadError(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  if (loading) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-6 py-14" data-testid="profile-loading">
        <div className="rounded-[2rem] bg-white/10 p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-300 border-t-transparent" />
          <p className="mt-4 text-white/80">Loading your Wonderland profile...</p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="profile-error">
        <section className="rounded-[2rem] border border-red-300/40 bg-red-500/15 p-6 text-red-100">
          {loadError}
        </section>
      </main>
    );
  }

  const user = profile.user;
  const employee = profile.employee;

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="profile-page">
      <section className="rounded-[2rem] bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 p-8 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em] text-yellow-100">
          My Wonderland account
        </p>
        <h1 className="mt-3 text-5xl font-black">Profile</h1>
        <p className="mt-4 max-w-3xl text-lg text-white/85">
          View your account details, role and employee-linked profile information where applicable.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ProfileCard label="Name" value={`${user.firstName} ${user.lastName}`} testId="profile-user-name" />
        <ProfileCard label="Email" value={user.email} testId="profile-user-email" wrap />
        <ProfileCard label="Role" value={user.role} testId="profile-user-role" />
        <ProfileCard label="WonderPoints" value={user.totalPoints ?? 0} testId="profile-user-points" />
        <ProfileCard label="Date of birth" value={formatDate(user.dateOfBirth)} testId="profile-user-dob" />
        <ProfileCard label="Age" value={calculateAge(user.dateOfBirth)} testId="profile-user-age" />
        <ProfileCard label="Account created" value={formatDate(user.createdAt)} testId="profile-user-created" />
      </section>

      {employee && (
        <section
          className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6"
          data-testid="profile-employee-section"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-bold uppercase tracking-[0.25em] text-cyan-300">
                Employee profile
              </p>
              <h2 className="mt-3 text-3xl font-black">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="mt-2 text-white/70">
                Employee-linked information for Admin and Manager accounts.
              </p>
            </div>

            <span
              className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-black text-slate-950"
              data-testid="profile-employee-active"
            >
              {employee.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <ProfileCard label="Employee ID" value={employee.employeeId} testId="profile-employee-id" />
            <ProfileCard label="Employee email" value={employee.email} testId="profile-employee-email" wrap />
            <ProfileCard label="Employee roles" value={employee.roles} testId="profile-employee-roles" />
            <ProfileCard
              label="Registered"
              value={employee.isRegistered ? "Yes" : "No"}
              testId="profile-employee-registered"
            />
            <ProfileCard
              label="Registered at"
              value={formatDate(employee.registeredAt)}
              testId="profile-employee-registered-at"
            />
          </div>

          <div className="mt-6 rounded-2xl border border-yellow-200/30 bg-yellow-300/10 p-4 text-sm text-yellow-100">
            Salary data is intentionally not shown on this profile page. It will remain restricted for future Admin/Manager reporting features.
          </div>
        </section>
      )}
    </main>
  );
}

function ProfileCard({ label, value, testId, wrap = false }) {
  return (
    <article className="rounded-[2rem] bg-white/10 p-6">
      <p className="text-sm font-bold text-white/60">{label}</p>
      <p
        className={[
          "mt-2 text-2xl font-black",
          wrap ? "break-all text-lg leading-snug" : "",
        ].join(" ")}
        data-testid={testId}
      >
        {value}
      </p>
    </article>
  );
}

export default ProfilePage;

