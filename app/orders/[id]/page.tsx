'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft, Trash2, Edit, Share2, CheckCircle, AlertCircle,
  Calendar, Package, User, FileText, Image as ImageIcon,
  Clock, Copy, MoreVertical,
} from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Order, orderStatuses, priorityLevels } from '@/app/types/order';
import InvoiceButton from '@/app/components/InvoiceButton';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session && params.id) {
      fetchOrder();
    }
  }, [session, params.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        setNewStatus(data.order.status);
      } else {
        setMessage({ type: 'error', text: 'Order not found' });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setMessage({ type: 'error', text: 'Failed to load order' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, statusNote }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }
      const data = await res.json();
      setOrder(data.order);
      setShowStatusModal(false);
      setStatusNote('');
      setMessage({ type: 'success', text: 'Status updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/orders/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/orders');
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete order' });
    }
  };

  const shareTrackingLink = () => {
    const trackingUrl = `${window.location.origin}/track/${order?.trackingToken}`;
    const text = `Track your order ${order?.orderId}: ${trackingUrl}`;
    if (navigator.share) {
      navigator.share({ title: `Order ${order?.orderId}`, text, url: trackingUrl });
    } else {
      navigator.clipboard.writeText(trackingUrl);
      setMessage({ type: 'success', text: 'Tracking link copied!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-400',
      measurements_taken: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400',
      fabric_sourced: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-400',
      cutting: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-400',
      in_progress: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400',
      fitting: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-400',
      alterations: 'bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-400',
      completed: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400',
      delivered: 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-400',
      cancelled: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400',
    };
    return map[status] || 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-400';
  };

  const getPriorityBadgeClasses = (priority: string) => {
    const map: Record<string, string> = {
      low: 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-400',
      medium: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400',
      high: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-400',
      urgent: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400',
    };
    return map[priority] || 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-400';
  };

  const isOverdue = order && new Date(order.deliveryDate) < new Date() && 
    !['delivered', 'completed', 'cancelled'].includes(order.status);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Order not found</h3>
            <div className="mt-6">
              <button
                onClick={() => router.push('/orders')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const client = order.clientId as any;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Orders</span>
        </button>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
                {order.orderId}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">{order.title}</p>
            </div>

            <div className="sm:hidden relative">
              <button onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-2">
                    <button onClick={() => { window.open(`/api/orders/${order._id}/invoice`, '_blank'); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-900 dark:text-white">Invoice</span>
                    </button>
                    <button onClick={() => { shareTrackingLink(); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-900 dark:text-white">Share</span>
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                    <button onClick={() => { handleDeleteOrder(); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-600 dark:text-red-400">Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="hidden sm:flex gap-3">
            <InvoiceButton orderId={order._id} orderNumber={order.orderId} />
            <button onClick={shareTrackingLink}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button onClick={handleDeleteOrder}
              className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-600 dark:border-red-400">
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Status</h2>
                <button onClick={() => setShowStatusModal(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Edit className="w-4 h-4" />
                  Update Status
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClasses(order.status)}`}>
                  {orderStatuses.find((s) => s.value === order.status)?.label}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityBadgeClasses(order.priority)}`}>
                  {priorityLevels.find((p) => p.value === order.priority)?.label} Priority
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Status History</h3>
                <div className="space-y-3">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-600 dark:bg-blue-400 ring-4 ring-blue-100 dark:ring-blue-900/50' : 'bg-gray-300 dark:bg-gray-600'
                        }`} />
                        {index !== order.statusHistory.length - 1 && (
                          <div className="w-0.5 h-full min-h-[20px] bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusBadgeClasses(history.status)}`}>
                            {orderStatuses.find((s) => s.value === history.status)?.label}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-600 dark:bg-blue-500 text-white">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(history.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                        {history.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">"{history.notes}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.clothingType.replace('_', ' ').toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity}</p>
                      </div>
                      {item.measurementId && (
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 rounded">
                          Measurements
                        </span>
                      )}
                    </div>
                    {item.fabric && <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">Fabric:</span> {item.fabric}</p>}
                    {item.color && <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">Color:</span> {item.color}</p>}
                    {item.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">{item.notes}</p>}
                  </div>
                ))}
              </div>
            </div>

            {order.images && order.images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Reference Images
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {order.images.map((image, index) => (
                    <img key={index} src={image} alt={`Reference ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => window.open(image, '_blank')} />
                  ))}
                </div>
              </div>
            )}

            {order.notes && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Notes</h2>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Client Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{client?.name}</p>
                </div>
                {client?.email && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{client.email}</p>
                  </div>
                )}
                {client?.phone && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{client.phone}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Date</p>
                  <p className={`font-medium flex items-center gap-2 ${
                    isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    <Clock className="w-4 h-4" />
                    {new Date(order.deliveryDate).toLocaleDateString()}
                    {isOverdue && <span className="text-xs">(Overdue)</span>}
                  </p>
                </div>
                {order.completedDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(order.completedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tracking</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Share this tracking link with your client</p>
              <div className="flex gap-2">
                <button onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/track/${order.trackingToken}`);
                  setMessage({ type: 'success', text: 'Link copied!' });
                  setTimeout(() => setMessage(null), 3000);
                }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button onClick={shareTrackingLink}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Update Order Status</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Status</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {orderStatuses.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note (Optional)</label>
                  <textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add a note about this status change..." rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowStatusModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleUpdateStatus} disabled={updating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed">
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}