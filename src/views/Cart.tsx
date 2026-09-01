import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Trash2, ShoppingBag } from 'lucide-react';

export const Cart: React.FC = () => {
  const [items, setItems] = useState([
    { id: '1', title: 'Formation React Avancé', price: 15000, quantity: 1 }
  ]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900">Mon Panier</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Votre panier est vide.</p>
          <Link to="/courses" className="mt-6 inline-block">
            <Button variant="primary">Parcourir les cours</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {items.map(item => (
              <Card key={item.id} className="border-none shadow-sm ring-1 ring-gray-100">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                    <p className="text-blue-600 font-bold mt-1">{item.price} FCFA</p>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Supprimer l'article"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-gray-50">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-bold text-lg text-gray-900">Résumé</h3>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Sous-total</span>
                  <span>{total} FCFA</span>
                </div>
                <div className="flex justify-between items-center text-xl font-extrabold text-gray-900 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>{total} FCFA</span>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Le prix définitif sera confirmé lors du paiement.
                </div>
                <Link to="/checkout" className="block w-full">
                  <Button variant="primary" fullWidth className="py-4 text-lg">
                    Passer à la caisse
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
