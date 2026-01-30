"use client";

import * as React from "react";

export type Role = "Author" | "Reviewer" | "Security" | "Approver" | "Admin";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = React.createContext<RoleContextValue | undefined>(undefined);

const ROLES: Role[] = ["Author", "Reviewer", "Security", "Approver", "Admin"];

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<Role>("Author");

  const setRole = React.useCallback((newRole: Role) => {
    setRoleState(newRole);
  }, []);

  const value = React.useMemo(
    () => ({ role, setRole }),
    [role, setRole]
  );

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = React.useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

export { ROLES };
