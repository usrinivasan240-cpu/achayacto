import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import axios from 'axios';
import { 
  PlusIcon, 
  PhotoIcon, 
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon 
} from '@heroicons/react/24/outline';
import moment from 'moment';

const DonorDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const { addNotification } = useNotifications();

  // Donation form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    foodType: 'veg',
    quantity: '',
    unit: 'plates',
    preparationTime: '',
    storageCondition: 'room temperature',
    location: '',
    latitude: '',
    longitude: '',
    hygieneChecked: false,
    foodImage: null,
    imagePreview: null
  });

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const fetchMyDonations = async () => {
    try {
      const response = await axios.get('/donations/my');
      setDonations(response.data.donations);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        foodImage: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            location: `Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`
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
            message: 'Unable to get current location'
          });
        }
      );
    }
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'imagePreview') {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.post('/donations', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      addNotification({
        type: 'success',
        title: 'Donation Created',
        message: 'Food donation submitted successfully. AI analysis completed.'
      });

      setShowDonationForm(false);
      setFormData({
        title: '',
        description: '',
        foodType: 'veg',
        quantity: '',
        unit: 'plates',
        preparationTime: '',
        storageCondition: 'room temperature',
        location: '',
        latitude: '',
        longitude: '',
        hygieneChecked: false,
        foodImage: null,
        imagePreview: null
      });
      fetchMyDonations();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: error.response?.data?.error || 'Failed to submit donation'
      });
    }

    setLoading(false);
  };

  const getSafetyStatusColor = (status) => {
    switch (status) {
      case 'Safe to Consume': return 'text-green-600 bg-green-100';
      case 'Consume Immediately': return 'text-yellow-600 bg-yellow-100';
      case 'Not Safe to Consume': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'claimed': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-purple-600 bg-purple-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const totalDonations = donations.length;
  const approvedDonations = donations.filter(d => d.status === 'approved').length;
  const completedDonations = donations.filter(d => d.status === 'completed').length;
  const totalMealsSaved = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + parseInt(d.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600">Food Donor Dashboard</p>
            </div>
            <button
              onClick={() => setShowDonationForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Donate Food
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PhotoIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Donations</p>
                <p className="text-2xl font-semibold text-gray-900">{totalDonations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{approvedDonations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPinIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{completedDonations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Meals Saved</p>
                <p className="text-2xl font-semibold text-gray-900">{totalMealsSaved}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recent Donations
              </button>
            </nav>
          </div>

          <div className="p-6">
            {donations.length === 0 ? (
              <div className="text-center py-12">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No donations yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by donating your first food item
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {donations.slice(0, 5).map((donation) => (
                  <div key={donation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{donation.title}</h3>
                        <p className="text-sm text-gray-500">{donation.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(donation.status)}`}>
                        {donation.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-1 font-medium">{donation.food_type}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <span className="ml-1 font-medium">{donation.quantity} {donation.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Prepared:</span>
                        <span className="ml-1 font-medium">{moment(donation.preparation_time).fromNow()}</span>
                      </div>
                      {donation.ai_safety_score && (
                        <div>
                          <span className="text-gray-500">AI Score:</span>
                          <span className={`ml-1 font-medium px-2 py-1 rounded text-xs ${getSafetyStatusColor(donation.ai_status)}`}>
                            {donation.ai_safety_score}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Donation Form Modal */}
      {showDonationForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Donate Food</h3>
                <button
                  onClick={() => setShowDonationForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitDonation} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Rice and Curry"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Food Type *</label>
                    <select
                      name="foodType"
                      value={formData.foodType}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="Brief description of the food items"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      required
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      placeholder="Number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="plates">Plates</option>
                      <option value="servings">Servings</option>
                      <option value="containers">Containers</option>
                      <option value="kg">Kg</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Storage Condition *</label>
                    <select
                      name="storageCondition"
                      value={formData.storageCondition}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="room temperature">Room Temperature</option>
                      <option value="refrigerated">Refrigerated</option>
                      <option value="covered">Covered</option>
                      <option value="uncovered">Uncovered</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Preparation Time *</label>
                  <input
                    type="datetime-local"
                    name="preparationTime"
                    required
                    value={formData.preparationTime}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pickup Location *</label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter address or landmark"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="mt-2 text-sm text-green-600 hover:text-green-500"
                  >
                    📍 Use Current Location
                  </button>
                </div>

                {/* Food Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Food Image *</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {formData.imagePreview ? (
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="mx-auto h-32 w-32 object-cover rounded"
                        />
                      ) : (
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      )}
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                          <span>Upload a photo</span>
                          <input
                            type="file"
                            name="foodImage"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                            required
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hygiene Checklist */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Hygiene Checklist *</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="hygieneChecked"
                        checked={formData.hygieneChecked}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        I confirm that this food was prepared within safe time limits and stored properly
                      </span>
                    </label>
                    <p className="text-xs text-gray-500">
                      By checking this box, you confirm that the food was cooked within safe time limits, 
                      stored in covered containers, and has had no human contact after cooking.
                    </p>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDonationForm(false)}
                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.foodImage}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit for AI Analysis'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;