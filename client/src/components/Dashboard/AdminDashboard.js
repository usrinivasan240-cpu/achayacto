import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import axios from 'axios';
import { 
  ChartBarIcon, 
  UsersIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PhotoIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import moment from 'moment';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState({});
  const [allDonations, setAllDonations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchAnalytics();
    fetchAllDonations();
    fetchAllUsers();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchAllDonations = async () => {
    try {
      const response = await axios.get('/donations/my');
      setAllDonations(response.data.donations);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      // This would need to be implemented in the backend
      // For now, we'll simulate some data
      const mockUsers = [
        { id: 1, name: 'Restaurant ABC', email: 'contact@restaurant.com', role: 'donor', created_at: '2024-01-01' },
        { id: 2, name: 'Food Bank NGO', email: 'info@foodbank.org', role: 'ngo', created_at: '2024-01-02' },
        { id: 3, name: 'Hotel XYZ', email: 'manager@hotel.com', role: 'donor', created_at: '2024-01-03' }
      ];
      setAllUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleRejectDonation = async (donationId) => {
    try {
      // This would need to be implemented in the backend
      addNotification({
        type: 'success',
        title: 'Donation Rejected',
        message: 'The donation has been manually rejected by admin'
      });
      fetchAllDonations();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: 'Failed to reject donation'
      });
    }
  };

  const handleApproveDonation = async (donationId) => {
    try {
      // This would need to be implemented in the backend
      addNotification({
        type: 'success',
        title: 'Donation Approved',
        message: 'The donation has been manually approved by admin'
      });
      fetchAllDonations();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: 'Failed to approve donation'
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Platform Overview & Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchAnalytics}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Refresh Analytics
              </button>
            </div>
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
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalDonations || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Safe Donations</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.safeDonations || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Claims</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalClaims || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <PhotoIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Meals Saved</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.mealsSaved || 0}</p>
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
                Platform Overview
              </button>
              <button
                onClick={() => setActiveTab('donations')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'donations'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Donations
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('safety')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'safety'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Safety Analysis
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Platform Statistics */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analytics.safeDonations || 0}</div>
                      <div className="text-sm text-gray-600">Safe Donations</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {analytics.totalDonations > 0 ? 
                          Math.round((analytics.safeDonations / analytics.totalDonations) * 100) : 0}% of total
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analytics.totalClaims || 0}</div>
                      <div className="text-sm text-gray-600">Claims Made</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {analytics.totalDonations > 0 ? 
                          Math.round((analytics.totalClaims / analytics.totalDonations) * 100) : 0}% claim rate
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{analytics.mealsSaved || 0}</div>
                      <div className="text-sm text-gray-600">Meals Saved</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total meals rescued from waste
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {allUsers.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Active Users</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Registered on platform
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {allDonations.slice(0, 5).map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="p-2 bg-white rounded mr-3">
                            <PhotoIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{donation.title}</div>
                            <div className="text-sm text-gray-600">
                              {donation.quantity} {donation.unit} • {moment(donation.created_at).fromNow()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSafetyStatusColor(donation.ai_status)}`}>
                            {donation.ai_status}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(donation.status)}`}>
                            {donation.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Safety Performance */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">AI Safety Scanner Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <div className="text-lg font-semibold text-green-800">
                            {allDonations.filter(d => d.ai_status === 'Safe to Consume').length}
                          </div>
                          <div className="text-sm text-green-700">Safe to Consume</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
                        <div>
                          <div className="text-lg font-semibold text-yellow-800">
                            {allDonations.filter(d => d.ai_status === 'Consume Immediately').length}
                          </div>
                          <div className="text-sm text-yellow-700">Consume Immediately</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
                        <div>
                          <div className="text-lg font-semibold text-red-800">
                            {allDonations.filter(d => d.ai_status === 'Not Safe to Consume').length}
                          </div>
                          <div className="text-sm text-red-700">Not Safe to Consume</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'donations' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">All Food Donations</h3>
                  <div className="text-sm text-gray-600">
                    Total: {allDonations.length} donations
                  </div>
                </div>
                
                {allDonations.length === 0 ? (
                  <div className="text-center py-12">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No donations found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No food donations have been submitted yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allDonations.map((donation) => (
                      <div key={donation.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">{donation.title}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSafetyStatusColor(donation.ai_status)}`}>
                                {donation.ai_status}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(donation.status)}`}>
                                {donation.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{donation.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <div className="font-medium">{donation.food_type}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Quantity:</span>
                            <div className="font-medium">{donation.quantity} {donation.unit}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Prepared:</span>
                            <div className="font-medium">{moment(donation.preparation_time).fromNow()}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Safety Score:</span>
                            <div className="font-medium">{donation.ai_safety_score}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Confidence:</span>
                            <div className="font-medium">{Math.round(donation.ai_confidence * 100)}%</div>
                          </div>
                        </div>

                        {donation.ai_explanation && (
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                            <h5 className="text-sm font-medium text-blue-800 mb-1">AI Analysis</h5>
                            <p className="text-sm text-blue-700">{donation.ai_explanation}</p>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            Created: {moment(donation.created_at).format('MMM DD, YYYY HH:mm')}
                          </div>
                          
                          <div className="flex space-x-2">
                            {donation.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveDonation(donation.id)}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectDonation(donation.id)}
                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Platform Users</h3>
                  <div className="text-sm text-gray-600">
                    Total: {allUsers.length} users
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'donor' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'ngo' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {moment(user.created_at).format('MMM DD, YYYY')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'safety' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">AI Safety Analysis</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Safety Score Distribution */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Safety Score Distribution</h4>
                    <div className="space-y-3">
                      {[
                        { range: '90-100%', color: 'bg-green-500', count: allDonations.filter(d => d.ai_safety_score >= 90).length },
                        { range: '70-89%', color: 'bg-green-400', count: allDonations.filter(d => d.ai_safety_score >= 70 && d.ai_safety_score < 90).length },
                        { range: '50-69%', color: 'bg-yellow-400', count: allDonations.filter(d => d.ai_safety_score >= 50 && d.ai_safety_score < 70).length },
                        { range: '0-49%', color: 'bg-red-400', count: allDonations.filter(d => d.ai_safety_score < 50).length }
                      ].map((item) => (
                        <div key={item.range} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded ${item.color} mr-3`}></div>
                            <span className="text-sm font-medium text-gray-700">{item.range}</span>
                          </div>
                          <span className="text-sm text-gray-600">{item.count} donations</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Common Safety Issues */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Common Safety Issues</h4>
                    <div className="space-y-3">
                      {[
                        { issue: 'Time exceeded for cooked food', count: allDonations.filter(d => d.ai_explanation?.includes('Time exceeded')).length },
                        { issue: 'Visible discoloration', count: allDonations.filter(d => d.ai_explanation?.includes('discoloration')).length },
                        { issue: 'Excessive moisture', count: allDonations.filter(d => d.ai_explanation?.includes('moisture')).length },
                        { issue: 'Texture degradation', count: allDonations.filter(d => d.ai_explanation?.includes('texture')).length }
                      ].map((item) => (
                        <div key={item.issue} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{item.issue}</span>
                          <span className="text-sm font-medium text-red-600">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Confidence Analysis */}
                <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">AI Confidence Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(
                          allDonations
                            .filter(d => d.ai_confidence >= 0.8)
                            .reduce((sum, d) => sum + d.ai_confidence, 0) / 
                          Math.max(allDonations.filter(d => d.ai_confidence >= 0.8).length, 1) * 100
                        )}%
                      </div>
                      <div className="text-sm text-gray-600">High Confidence</div>
                      <div className="text-xs text-gray-500">
                        {allDonations.filter(d => d.ai_confidence >= 0.8).length} donations
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Math.round(
                          allDonations
                            .filter(d => d.ai_confidence >= 0.6 && d.ai_confidence < 0.8)
                            .reduce((sum, d) => sum + d.ai_confidence, 0) / 
                          Math.max(allDonations.filter(d => d.ai_confidence >= 0.6 && d.ai_confidence < 0.8).length, 1) * 100
                        )}%
                      </div>
                      <div className="text-sm text-gray-600">Medium Confidence</div>
                      <div className="text-xs text-gray-500">
                        {allDonations.filter(d => d.ai_confidence >= 0.6 && d.ai_confidence < 0.8).length} donations
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {Math.round(
                          allDonations
                            .filter(d => d.ai_confidence < 0.6)
                            .reduce((sum, d) => sum + d.ai_confidence, 0) / 
                          Math.max(allDonations.filter(d => d.ai_confidence < 0.6).length, 1) * 100
                        )}%
                      </div>
                      <div className="text-sm text-gray-600">Low Confidence</div>
                      <div className="text-xs text-gray-500">
                        {allDonations.filter(d => d.ai_confidence < 0.6).length} donations
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;