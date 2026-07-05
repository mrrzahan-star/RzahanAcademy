import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export interface MembershipStatus {
  currentPackageSlug: string;
  packageName: string;
  packageEmoji: string;
  packageColor: string;
  requiredLevel: number;
  membershipExpiresAt: string | null;
  daysRemaining: number | null;
  isExpiringSoon: boolean;
}

const DEFAULTS: MembershipStatus = {
  currentPackageSlug: "baslanqic",
  packageName: "Başlanğıc",
  packageEmoji: "🌱",
  packageColor: "#6366f1",
  requiredLevel: 0,
  membershipExpiresAt: null,
  daysRemaining: null,
  isExpiringSoon: false,
};

export function useMembership(): MembershipStatus & { isLoading: boolean; canAccess: (requiredLevel: number) => boolean } {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<MembershipStatus>({
    queryKey: ["membership-my"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const r = await fetch("/api/memberships/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return DEFAULTS;
      return r.json();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const status = data ?? DEFAULTS;

  return {
    ...status,
    isLoading,
    canAccess: (requiredLevel: number) => status.requiredLevel >= requiredLevel,
  };
}
