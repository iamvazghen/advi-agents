import { useEffect, useRef, useState } from 'react';
import { useOrganization, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to handle organization switching and ensure redirection to the organization's main page
 */
export function useOrganizationRedirect() {
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const { setActive } = useClerk();
  const router = useRouter();
  const prevOrgIdRef = useRef<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // If organization changes, ensure auth context is updated before redirecting
    const handleOrgChange = async () => {
      if (organization?.id && prevOrgIdRef.current !== organization.id && !isRedirecting && isOrgLoaded) {
        console.log(`Organization change detected: ${prevOrgIdRef.current} -> ${organization.id}`);
        setIsRedirecting(true);
        
        try {
          // First, ensure the active organization is set in Clerk
          console.log(`Setting active organization to: ${organization.id}`);
          await setActive({ organization: organization.id });
          console.log(`Successfully set active organization to: ${organization.id}`);
          
          const currentPath = window.location.pathname;
          
          // Check if we're already in a path for this organization
          const orgPathPattern = new RegExp(`^/dashboard/org/${organization.id}`);
          const isAlreadyInOrgPath = orgPathPattern.test(currentPath);
          
          if (!isAlreadyInOrgPath) {
            // If we're not in a path for this organization, redirect to the organization's main page
            const newPath = `/dashboard/org/${organization.id}`;
            console.log('Organization changed, redirecting to:', newPath);
            
            // Add a small delay to ensure auth context is fully updated
            const delay = 100;
            
            setTimeout(() => {
              router.push(newPath);
              setIsRedirecting(false);
            }, delay);
          } else {
            // We're already in a path for this organization, no need to redirect
            console.log('Already in organization path, no redirect needed');
            setIsRedirecting(false);
          }
        } catch (error) {
          console.error('Error updating active organization:', error);
          setIsRedirecting(false);
        }
        
        prevOrgIdRef.current = organization.id;
      }
    };
    
    handleOrgChange();
  }, [organization?.id, router, setActive, isOrgLoaded, isRedirecting]);

  return {
    organizationId: organization?.id || null,
    isRedirecting
  };
}