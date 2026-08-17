import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useFrappeAuth, useFrappePostCall } from 'frappe-react-sdk';
import { Order } from '../types';

interface CartContextType {
  cart: Order | null;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  itemsCount: number;
  hasItem: (packageName: string) => boolean;
  addToCart: (packageName: string) => Promise<boolean>;
  removeFromCart: (packageName: string) => Promise<boolean>;
  setSchedule: (scheduledAt: string) => Promise<boolean>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useFrappeAuth();
  const [cart, setCart] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { call: fetchCartCall } = useFrappePostCall('servora.api.get_or_create_cart');
  const { call: addToCartCall } = useFrappePostCall('servora.api.add_to_cart');
  const { call: removeFromCartCall } = useFrappePostCall('servora.api.remove_from_cart');
  const { call: setScheduleCall } = useFrappePostCall('servora.api.set_order_schedule');

  const refreshCart = useCallback(async () => {
    if (!currentUser || currentUser === 'Guest') {
      setCart(null);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchCartCall({});
      if (res && res.message) {
        setCart(res.message);
      }
    } catch (err: any) {
      console.warn('Error fetching cart:', err);
      // For unauthenticated or new user without cart
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchCartCall]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const hasItem = useCallback((packageName: string) => {
    if (!cart || !cart.items) return false;
    return cart.items.some(item => item.service_package === packageName);
  }, [cart]);

  const addToCart = async (packageName: string): Promise<boolean> => {
    if (!currentUser || currentUser === 'Guest') {
      setError('Please log in to add services to your cart.');
      return false;
    }

    try {
      setIsActionLoading(true);
      setError(null);
      const res = await addToCartCall({
        service_package: packageName,
        order_id: cart?.name || undefined,
      });

      if (res && res.message) {
        setCart(res.message);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      const errMsg = err?.message || err?._server_messages || 'Failed to add item to cart.';
      setError(errMsg);
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  const removeFromCart = async (packageName: string): Promise<boolean> => {
    if (!cart) return false;

    try {
      setIsActionLoading(true);
      setError(null);
      const res = await removeFromCartCall({
        service_package: packageName,
        order_id: cart.name,
      });

      if (res && res.message) {
        setCart(res.message);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove item from cart.');
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  const setSchedule = async (scheduledAt: string): Promise<boolean> => {
    if (!cart) return false;

    try {
      setIsActionLoading(true);
      setError(null);
      const res = await setScheduleCall({
        order_id: cart.name,
        scheduled_at: scheduledAt,
      });

      if (res && res.message) {
        setCart(res.message);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error scheduling slot:', err);
      setError('Failed to update service slot.');
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  const clearCart = useCallback(() => {
    setCart(null);
  }, []);

  const itemsCount = cart?.items?.length || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isActionLoading,
        error,
        itemsCount,
        hasItem,
        addToCart,
        removeFromCart,
        setSchedule,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
