'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Plus, Trash2, Ruler, Calendar } from 'lucide-react';
import { Client, Measurement, clothingTypes, measurementFields } from '@/app/types';
import DashboardLayout from '@/app/components/DashboardLayout';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [client, setClient] = useState<Client | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session && params.id) {
      fetchClient();
      fetchMeasurements();
    }
  }, [session, params.id]);

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
      }
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeasurements = async () => {
    try {
      const res = await fetch(`/api/measurements?clientId=${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setMeasurements(data.measurements || []);
      }
    } catch (error) {
      console.error('Error fetching measurements:', error);
    }
  };

  const deleteClient = async () => {
    if (!confirm('Are you sure you want to delete this client? All measurements will be deleted.')) {
      return;
    }

    try {
      const res = await fetch(`/api/clients/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Client not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {client.gender.charAt(0).toUpperCase() + client.gender.slice(1)} •{' '}
                {client.email || client.phone || 'No contact info'}
              </p>
            </div>
            <button
              onClick={deleteClient}
              className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span className="hidden sm:inline">Delete Client</span>
            </button>
          </div>
        </div>

        {/* Client Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-white">{client.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
              <p className="text-gray-900 dark:text-white">{client.phone || 'Not provided'}</p>
            </div>
            {client.notes && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                <p className="text-gray-900 dark:text-white">{client.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Measurements Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Measurements</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Measurement</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {measurements.length === 0 ? (
              <div className="text-center py-12">
                <Ruler className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No measurements yet. Add the first one!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {measurements.map((measurement) => (
                  <div key={measurement._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                          {measurement.clothingType}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(measurement.createdAt).toLocaleDateString()}</span>
                          <span className="text-gray-400 dark:text-gray-600">•</span>
                          <span className="capitalize">{measurement.unit}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Object.entries(measurement.measurements).map(([key, value]) => {
                        const field = measurementFields[measurement.clothingType]?.find(
                          (f) => f.key === key
                        );
                        return (
                          <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{field?.label || key}</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {value} {measurement.unit}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {measurement.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                        <p className="text-gray-900 dark:text-white mt-1">{measurement.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Measurement Modal */}
      {showAddModal && (
        <AddMeasurementModal
          client={client}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchMeasurements();
          }}
        />
      )}
    </DashboardLayout>
  );
}

function AddMeasurementModal({
  client,
  onClose,
  onSuccess,
}: {
  client: Client;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [clothingType, setClothingType] = useState('');
  const [measurements, setMeasurements] = useState<{ [key: string]: number }>({});
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableClothingTypes = clothingTypes[client.gender] || [];
  const fields = clothingType ? measurementFields[clothingType] || [] : [];

  const handleMeasurementChange = (key: string, value: string) => {
    const numValue = parseFloat(value);
    setMeasurements((prev) => ({
      ...prev,
      [key]: isNaN(numValue) ? 0 : numValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client._id,
          clothingType,
          measurements,
          unit,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add measurement');
        return;
      }

      onSuccess();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 my-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Add New Measurement</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Clothing Type *
              </label>
              <select
                value={clothingType}
                onChange={(e) => {
                  setClothingType(e.target.value);
                  setMeasurements({});
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select type</option>
                {availableClothingTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'inches' | 'cm')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="inches">Inches</option>
                <option value="cm">Centimeters</option>
              </select>
            </div>
          </div>

          {fields.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Measurements</h3>
              <div className="grid grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={measurements[field.key] || ''}
                      onChange={(e) => handleMeasurementChange(field.key, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !clothingType}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Measurement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}