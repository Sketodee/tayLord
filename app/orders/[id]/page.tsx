'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Trash2,
  Edit,
  Share2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Package,
  User,
  FileText,
  Image as ImageIcon,
  Clock,
  Copy,
  Receipt,
  MoreVertical
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
        body: JSON.stringify({
          status: newStatus,
          statusNote,
        }),
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
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/orders');
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete order' });
    }
  };

  const copyTrackingLink = () => {
    const trackingUrl = `${window.location.origin}/track/${order?.trackingToken}`;
    navigator.clipboard.writeText(trackingUrl);
    setMessage({ type: 'success', text: 'Tracking link copied to clipboard!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const shareTrackingLink = () => {
    const trackingUrl = `${window.location.origin}/track/${order?.trackingToken}`;
    const text = `Track your order ${order?.orderId}: ${trackingUrl}`;

    if (navigator.share) {
      navigator.share({
        title: `Order ${order?.orderId}`,
        text: text,
        url: trackingUrl,
      });
    } else {
      copyTrackingLink();
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = orderStatuses.find((s) => s.value === status);
    return statusObj?.color || 'gray';
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorityLevels.find((p) => p.value === priority);
    return priorityObj?.color || 'gray';
  };

  const isOverdue = order && new Date(order.deliveryDate) < new Date() &&
    !['delivered', 'completed', 'cancelled'].includes(order.status);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Order not found</p>
            <button
              onClick={() => router.push('/orders')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const client = order.clientId as any;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/orders')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Orders</span>
          </button>

        
          <div>
    {/* Title & Menu */}
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
          {order.orderId}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
          {order.title}
        </p>
      </div>

      {/* Mobile Menu Button */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-2">
              <button
                onClick={() => {
                  window.open(`/api/orders/${order._id}/invoice`, '_blank');
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FileText className="w-4 h-4 text-green-600" />
                <span className="text-sm">Invoice</span>
              </button>
              <button
                onClick={() => {
                  shareTrackingLink();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Share2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Share</span>
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              <button
                onClick={() => {
                  handleDeleteOrder();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">Delete</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>

    {/* Desktop Buttons */}
    <div className="hidden sm:flex gap-3">
      <InvoiceButton orderId={order._id} orderNumber={order.orderId} />
      <button
        onClick={shareTrackingLink}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>
      <button
        onClick={handleDeleteOrder}
        className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-600 dark:border-red-400"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>
  </div>



        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
              }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Status</h2>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Update Status
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full bg-${getStatusColor(
                    order.status
                  )}-100 dark:bg-${getStatusColor(order.status)}-900/50 text-${getStatusColor(
                    order.status
                  )}-800 dark:text-${getStatusColor(order.status)}-400`}
                >
                  {orderStatuses.find((s) => s.value === order.status)?.label}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full bg-${getPriorityColor(
                    order.priority
                  )}-100 dark:bg-${getPriorityColor(order.priority)}-900/50 text-${getPriorityColor(
                    order.priority
                  )}-800 dark:text-${getPriorityColor(order.priority)}-400`}
                >
                  {priorityLevels.find((p) => p.value === order.priority)?.label} Priority
                </span>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Status History</h3>
                <div className="space-y-3">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        {index < order.statusHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {orderStatuses.find((s) => s.value === history.status)?.label}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(history.date).toLocaleString()}
                        </p>
                        {history.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{history.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                          {item.clothingType.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    {item.fabric && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Fabric:</span> {item.fabric}
                      </p>
                    )}
                    {item.color && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Color:</span> {item.color}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <span className="font-medium">Notes:</span> {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reference Images */}
            {order.images && order.images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Reference Images
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {order.images.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative"
                    >
                      <img
                        src={url}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg group-hover:opacity-75 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {(order.description || order.notes) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notes
                </h2>
                {order.description && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400">{order.description}</p>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Notes</h3>
                    <p className="text-gray-600 dark:text-gray-400">{order.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
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
                    <p className="text-gray-900 dark:text-white">{client.email}</p>
                  </div>
                )}
                {client?.phone && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="text-gray-900 dark:text-white">{client.phone}</p>
                  </div>
                )}
                <button
                  onClick={() => router.push(`/clients/${client._id}`)}
                  className="w-full mt-4 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  View Client Profile
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Important Dates
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
                  <p className="text-gray-900 dark:text-white">{new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Date</p>
                  <p className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {new Date(order.deliveryDate).toLocaleDateString()}
                    {isOverdue && <span className="block text-xs">Overdue!</span>}
                  </p>
                </div>
                {order.completedDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed Date</p>
                    <p className="text-gray-900 dark:text-white">{new Date(order.completedDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Link */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Tracking</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Share this link with your customer to let them track the order progress
              </p>
              <div className="flex gap-2">
                <button
                  onClick={copyTrackingLink}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
                <button
                  onClick={shareTrackingLink}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Update Status Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Update Order Status</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note (Optional)
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add a note about this status change..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
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