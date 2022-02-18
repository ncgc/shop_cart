import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
     const updatedCart = [...cart];

     const stock = await api.get(`/stock/${productId}`);
     const stockAmount = stock.data.amount;

     const productInCart = updatedCart.find(product => product.id === productId);
     const currentCartAmount = productInCart ? productInCart.amount : 0;
     const requestedAmount = currentCartAmount + 1;
     
     
     if (requestedAmount > stockAmount) {
      toast.error('Quantidade solicitada fora de estoque');
      return ;
     }

     if (productInCart){
       productInCart.amount = requestedAmount;
     } else {
       const product = await api.get(`/products/${productId}`);
       const newProduct = {
         ... product.data,
         amount: requestedAmount
       };
      updatedCart.push(newProduct);
     }

     setCart(updatedCart);
     localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
    } catch {
     toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart];
      const cartWithoutProduct = updatedCart.filter(product => product.id !== productId);
      
      setCart(cartWithoutProduct);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartWithoutProduct));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {

    } catch {
      
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
