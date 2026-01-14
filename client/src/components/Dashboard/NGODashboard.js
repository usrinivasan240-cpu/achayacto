import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import axios from 'axios';
import { 
  MapPinIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  PhotoIcon 
} from '@heroicons/react/24/outline';
import moment from 'moment';

const NGODashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('available');
  const [availableDonations, setAvailableDonations] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [radius, setRadius] = useState(10);
  const { addNotification } = useNotifications();

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          addNotification({
            type: 'success',
            title: 'Location Updated',
            message: 'Current location captured successfully'
          });
        },
        (error) => {
          addNotification({
            type: 'error',
            title: 'Location Error',
            message: 'Please enable location services to find nearby donations'
          });
        }
      );
    }
  }, [addNotification]);

  const fetchAvailableDonations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/donations/nearby', {
        params: {
          latitude: location.lat,
          longitude: location.lng,
          radius: radius
        }
      });
      setAvailableDonations(response.data.donations);
    } catch (error) {
      console.error('Error fetching donations:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch nearby donations'
      });
    } finally {
      setLoading(false);
    }
  }, [location.lat, location.lng, radius, addNotification]);

  const fetchMyClaims = useCallback(async () => {
    try {
      const response = await axios.get('/donations/my');
      setMyClaims(response.data.donations.filter(d => d.status === 'claimed' || d.status === 'completed'));
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    if (location.lat && location.lng) {
      fetchAvailableDonations();
    }
    fetchMyClaims();
  }, [location.lat, location.lng, radius, fetchAvailableDonations, fetchMyClaims]);

  const handleClaimDonation = async (donationId) => {
    try {
      const pickupTime = new Date();
      pickupTime.setHours(pickupTime.getHours() + 2); // Default pickup in 2 hours

      await axios.post(`/donations/${donationId}/claim`, {
        pickupTime: pickupTime.toISOString()
      });

      addNotification({
        type: 'success',
        title: 'Donation Claimed',
        message: 'You have successfully claimed this donation. Contact the donor to arrange pickup.'
      });

      fetchAvailableDonations();
      fetchMyClaims();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Claim Failed',
        message: error.response?.data?.error || 'Failed to claim donation'
      });
    }
  };

  const getSafetyStatusColor = (status) => {
    switch (status) {
      case 'Safe to Consume': return 'text-green-600 bg-green-100';
      case 'Consume Immediately': return 'text-yellow-600 bg-yellow-100';
      case 'Not Safe to Consume': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSafetyScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalClaims = myClaims.length;
  const completedClaims = myClaims.filter(c => c.status === 'completed').length;
  const totalMealsCollected = myClaims
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + parseInt(c.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                NGO Dashboard
              </h1>
              <p className="text-gray-600">Welcome, {user.organization || user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Search Radius</div>
                <select
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="mt-1 block border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                </select>
              </div>
              <button
                onClick={getCurrentLocation}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <MapPinIcon className="h-5 w-5 mr-2" />
                Refresh Location
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Claims</p>
                <p className="text-2xl font-semibold text-gray-900">{totalClaims}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{completedClaims}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <PhotoIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Meals Collected</p>
                <p className="text-2xl font-semibold text-gray-900">{totalMealsCollected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('available')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available Donations ({availableDonations.length})
              </button>
              <button
                onClick={() => setActiveTab('claims')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'claims'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Claims ({myClaims.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'available' && (
              <div>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : availableDonations.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No donations available</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {location.lat ? 'No food donations found in your area' : 'Please enable location services to find nearby donations'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {availableDonations.map((donation) => (
                      <div key={donation.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-medium text-gray-900">{donation.title}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSafetyStatusColor(donation.ai_status)}`}>
                                {donation.ai_status}
                              </span>
                            </div>
                            <p className="text-gray-600 mt-1">{donation.description}</p>
                          </div>
                          {donation.distance && (
                            <div className="text-sm text-gray-500">
                              📍 {donation.distance} km away
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center">
                            <div className="p-1 bg-gray-100 rounded mr-2">
                              <PhotoIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{donation.quantity} {donation.unit}</div>
                              <div className="text-xs text-gray-500">{donation.food_type}</div>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <div className="p-1 bg-gray-100 rounded mr-2">
                              <ClockIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {moment(donation.preparation_time).fromNow()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {donation.storage_condition}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <div className="p-1 bg-gray-100 rounded mr-2">
                              <ExclamationTriangleIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className={`text-sm font-medium ${getSafetyScoreColor(donation.ai_safety_score)}`}>
                                Safety Score: {donation.ai_safety_score}%
                              </div>
                              <div className="text-xs text-gray-500">
                                {Math.round(donation.ai_confidence * 100)}% confidence
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <div className="p-1 bg-gray-100 rounded mr-2">
                              <MapPinIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">Pickup</div>
                              <div className="text-xs text-gray-500">{donation.location}</div>
                            </div>
                          </div>
                        </div>

                        {donation.ai_explanation && (
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                            <div className="flex">
                              <ExclamationTriangleIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-sm font-medium text-blue-800">AI Analysis</h4>
                                <p className="text-sm text-blue-700 mt-1">{donation.ai_explanation}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {donation.image_path && (
                          <div className="mb-4">
                            <img
                              src={`http://localhost:5000${donation.image_path}`}
                              alt={donation.title}
                              className="w-full max-w-xs h-48 object-cover rounded-lg border"
                            />
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center">
                              <PhoneIcon className="h-4 w-4 mr-1" />
                              {donation.donor_phone || 'Contact not available'}
                            </div>
                            <div className="mt-1">
                              Donor: {donation.donor_name} {donation.donor_org && `(${donation.donor_org})`}
                            </div>
                          </div>

                          <button
                            onClick={() => handleClaimDonation(donation.id)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center font-medium"
                          >
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            Claim Donation
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'claims' && (
              <div>
                {myClaims.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No claims yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your claimed donations will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {myClaims.map((claim) => (
                      <div key={claim.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{claim.title}</h3>
                            <p className="text-sm text-gray-500">{claim.description}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            claim.status === 'completed' ? 'text-green-600 bg-green-100' :
                            claim.status === 'claimed' ? 'text-blue-600 bg-blue-100' :
                            'text-yellow-600 bg-yellow-100'
                          }`}>
                            {claim.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Quantity:</span>
                            <span className="ml-1 font-medium">{claim.quantity} {claim.unit}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <span className="ml-1 font-medium">{claim.food_type}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Prepared:</span>
                            <span className="ml-1 font-medium">{moment(claim.preparation_time).fromNow()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Location:</span>
                            <span className="ml-1 font-medium">{claim.location}</span>
                          </div>
                        </div>

                        {claim.status === 'claimed' && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex">
                              <ClockIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                              <div>
                                <h4 className="text-sm font-medium text-yellow-800">Next Steps</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                  Contact the donor to arrange pickup. Remember to re-scan the food at pickup time for quality verification.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {claim.status === 'completed' && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex">
                              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                              <div>
                                <h4 className="text-sm font-medium text-green-800">Donation Completed</h4>
                                <p className="text-sm text-green-700 mt-1">
                                  Thank you for helping reduce food waste! This meal has been saved from going to waste.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;