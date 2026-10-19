/**
 * Utility helper to determine navigation route and tab for notifications
 * based on notification type, referenceId, and user role.
 */

export function getNotificationDestination(notification, userRole) {
  if (!notification) return null;

  const type = notification.type;
  const refId = notification.referenceId;
  const role = userRole || 'Pet Owner';

  switch (type) {
    case 'APPOINTMENT':
      if (role === 'Veterinarian') {
        return {
          path: '/dashboard/vet?tab=Appointments',
          label: 'View Appointment',
          type: 'navigation'
        };
      }
      if (role === 'Admin') {
        return {
          path: '/dashboard/admin',
          label: 'View Appointments',
          type: 'navigation'
        };
      }
      return {
        path: '/dashboard/owner?tab=Appointments',
        label: 'View Appointment',
        type: 'navigation'
      };

    case 'CHAT':
      return {
        path: role === 'Veterinarian' ? '/dashboard/vet?tab=Appointments' : '/dashboard/owner?tab=Appointments',
        label: 'Open Chat',
        type: 'chat',
        appointmentId: refId,
        otherUserName: notification.title ? notification.title.replace('New message from ', '').trim() : 'Chat'
      };

    case 'VACCINATION':
    case 'PET':
    case 'VETSCAN':
      if (role === 'Veterinarian') {
        return {
          path: '/dashboard/vet?tab=Patients',
          label: 'View Patient',
          type: 'navigation'
        };
      }
      if (type === 'VETSCAN') {
        return {
          path: '/dashboard/owner?tab=VetScan AI',
          label: 'View Scan Report',
          type: 'navigation'
        };
      }
      return {
        path: '/dashboard/owner?tab=Medical Records',
        label: 'View Health Records',
        type: 'navigation'
      };

    case 'ACCOUNT_APPROVED':
    case 'ACCOUNT_REJECTED':
    case 'VERIFICATION':
      if (role === 'Admin') {
        const text = `${notification.title || ''} ${notification.message || ''}`.toLowerCase();
        if (text.includes('veterinarian') || text.includes('vet')) {
          return {
            path: refId ? `/dashboard/admin/veterinarians/${refId}` : '/dashboard/admin/veterinarians',
            label: 'Review Vet Verification',
            type: 'navigation'
          };
        }
        if (text.includes('shelter')) {
          return {
            path: '/dashboard/admin/shelters',
            label: 'Review Shelter Verification',
            type: 'navigation'
          };
        }
        if (text.includes('seller')) {
          return {
            path: '/dashboard/admin/sellers',
            label: 'Review Seller Verification',
            type: 'navigation'
          };
        }
        return {
          path: '/dashboard/admin/veterinarians',
          label: 'Review Verification',
          type: 'navigation'
        };
      }
      if (role === 'Veterinarian') {
        return {
          path: '/dashboard/vet?tab=Profile & Verification',
          label: 'View Verification',
          type: 'navigation'
        };
      }
      if (role === 'Shelter Manager') {
        return {
          path: '/dashboard/shelter?tab=Shelter Profile',
          label: 'View Shelter Profile',
          type: 'navigation'
        };
      }
      if (role === 'Marketplace Seller') {
        return {
          path: '/dashboard/seller?tab=Settings',
          label: 'View Verification Status',
          type: 'navigation'
        };
      }
      return {
        path: '/dashboard/owner?tab=Profile',
        label: 'View Profile',
        type: 'navigation'
      };

    case 'PRODUCT_APPROVED':
    case 'PRODUCT_REJECTED':
    case 'PRODUCT':
      if (role === 'Admin') {
        return {
          path: '/dashboard/admin/products',
          label: 'Moderate Products',
          type: 'navigation'
        };
      }
      if (role === 'Marketplace Seller') {
        return {
          path: '/dashboard/seller?tab=My Products',
          label: 'View Inventory',
          type: 'navigation'
        };
      }
      return {
        path: refId ? `/marketplace/products/${refId}` : '/marketplace/products',
        label: 'View Product',
        type: 'navigation'
      };

    case 'ORDER':
    case 'PAYMENT':
      if (role === 'Marketplace Seller') {
        return {
          path: '/dashboard/seller?tab=Orders',
          label: 'View Orders',
          type: 'navigation'
        };
      }
      if (role === 'Admin') {
        return {
          path: '/dashboard/admin',
          label: 'View Admin Analytics',
          type: 'navigation'
        };
      }
      return {
        path: '/marketplace/orders',
        label: 'View Orders',
        type: 'navigation'
      };

    case 'ADOPTION':
    case 'ADOPTION_APPLICATION':
      if (role === 'Admin') {
        return {
          path: '/dashboard/admin/adoptions',
          label: 'Review Adoption Listings',
          type: 'navigation'
        };
      }
      if (role === 'Shelter Manager') {
        return {
          path: '/dashboard/shelter?tab=Adoptions',
          label: 'View Applications',
          type: 'navigation'
        };
      }
      return {
        path: '/dashboard/owner?tab=Adoptions',
        label: 'View Adoption Status',
        type: 'navigation'
      };

    case 'REHOMING':
      return {
        path: '/rehoming',
        label: 'View Rehoming Board',
        type: 'navigation'
      };

    case 'PROFILE':
      if (role === 'Veterinarian') return { path: '/dashboard/vet?tab=Profile & Verification', label: 'View Profile', type: 'navigation' };
      if (role === 'Shelter Manager') return { path: '/dashboard/shelter?tab=Shelter Profile', label: 'View Profile', type: 'navigation' };
      if (role === 'Marketplace Seller') return { path: '/dashboard/seller?tab=Settings', label: 'View Settings', type: 'navigation' };
      return { path: '/dashboard/owner?tab=Profile', label: 'View Profile', type: 'navigation' };

    default:
      if (role === 'Admin') return { path: '/dashboard/admin', label: 'Open Console', type: 'navigation' };
      if (role === 'Veterinarian') return { path: '/dashboard/vet', label: 'Open Dashboard', type: 'navigation' };
      if (role === 'Shelter Manager') return { path: '/dashboard/shelter', label: 'Open Dashboard', type: 'navigation' };
      if (role === 'Marketplace Seller') return { path: '/dashboard/seller', label: 'Open Dashboard', type: 'navigation' };
      return { path: '/dashboard/owner', label: 'Open Dashboard', type: 'navigation' };
  }
}
