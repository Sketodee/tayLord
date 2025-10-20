'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Package, Calendar, CheckCircle, Clock, Phone, Mail } from 'lucide-react';
import { orderStatuses } from '@/app/types/order';

export default function PublicTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.token) {
      fetchTrackingInfo();
    }
  }, [params.token]);

  const fetchTrackingInfo = async () => {
    try {
      const res = await fetch(`/api/track/${params.token}`);
      
      if (!res.ok) {
        throw new Error('Order not found');
      }

      const data = await res.json();
      setOrder(data.order);
      setBusiness(data.business);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    return orderStatuses.findIndex(s => s.value === status);
  };

  const getProgressPercentage = () => {
    if (!order) return 0;
    const currentIndex = getStatusIndex(order.status);
    const totalStatuses = orderStatuses.length - 1; // Exclude cancelled
    return Math.round((currentIndex / totalStatuses) * 100);
  };

  const isStatusCompleted = (status: string) => {
    const currentIndex = getStatusIndex(order.status);
    const statusIndex = getStatusIndex(status);
    return statusIndex <= currentIndex;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600">
            We couldn't find an order with this tracking link. Please check the link and try again.
          </p>
        </div>
      </div>
    );
  }

  const brandColor = business?.primaryColor || '#3B82F6';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with branding */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6 text-center">
          {business?.logoUrl && (
            <img
              src={business.logoUrl}
              alt={business.businessName}
              className="h-16 mx-auto mb-4"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900">
            {business?.businessName || 'Order Tracking'}
          </h1>
          <p className="text-gray-600 mt-2">Track your order in real-time</p>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600">Order Number</p>
              <h2 className="text-2xl font-bold text-gray-900">{order.orderId}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Status</p>
              <span 
                className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white mt-1"
                style={{ backgroundColor: brandColor }}
              >
                {orderStatuses.find(s => s.value === order.status)?.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Package className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-600">Order Title</p>
                <p className="font-medium text-gray-900">{order.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-600">Order Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.orderDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-600">Expected Delivery</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.deliveryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {order.description && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="text-gray-900">{order.description}</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Order Progress</h3>
            <span className="text-2xl font-bold" style={{ color: brandColor }}>
              {getProgressPercentage()}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${getProgressPercentage()}%`,
                backgroundColor: brandColor 
              }}
            />
          </div>

          {/* Status Timeline */}
          <div className="space-y-6">
            {orderStatuses
              .filter(s => s.value !== 'cancelled')
              .map((statusItem, index) => {
                const completed = isStatusCompleted(statusItem.value);
                const isCurrent = order.status === statusItem.value;
                const historyItem = order.statusHistory.find((h: any) => h.status === statusItem.value);

                return (
                  <div key={statusItem.value} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          completed
                            ? 'text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                        style={completed ? { backgroundColor: brandColor } : {}}
                      >
                        {completed ? <CheckCircle className="w-6 h-6" /> : <div className="w-3 h-3 rounded-full bg-gray-400" />}
                      </div>
                      {index < orderStatuses.length - 2 && (
                        <div className={`w-0.5 h-12 ${completed ? 'bg-blue-600' : 'bg-gray-200'}`} style={completed ? { backgroundColor: brandColor } : {}} />
                      )}
                    </div>
                    
                    <div className="flex-1 pb-8">
                      <h4 className={`font-semibold ${isCurrent ? 'text-gray-900' : completed ? 'text-gray-700' : 'text-gray-400'}`}>
                        {statusItem.label}
                        {isCurrent && (
                          <span 
                            className="ml-2 text-xs px-2 py-1 rounded-full text-white"
                            style={{ backgroundColor: brandColor }}
                          >
                            Current
                          </span>
                        )}
                      </h4>
                      {historyItem && (
                        <div className="mt-1">
                          <p className="text-sm text-gray-600">
                            {new Date(historyItem.date).toLocaleString()}
                          </p>
                          {historyItem.notes && (
                            <p className="text-sm text-gray-600 mt-1">{historyItem.notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {item.clothingType.replace('_', ' ')}
                  </p>
                  {item.fabric && (
                    <p className="text-sm text-gray-600">Fabric: {item.fabric}</p>
                  )}
                  {item.color && (
                    <p className="text-sm text-gray-600">Color: {item.color}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-semibold text-gray-900">{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        {(business?.phone || business?.email) && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about your order, feel free to contact us:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: brandColor }}
                >
                  <Phone className="w-5 h-5" />
                  {business.phone}
                </a>
              )}
              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ borderColor: brandColor, color: brandColor }}
                >
                  <Mail className="w-5 h-5" />
                  {business.email}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}