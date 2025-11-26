'use client';

import { useState } from 'react';

export default function NewAssignment() {
  const [courseId, setCourseId] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [loading, setLoading] = useState(false);

  async function createAssignment() {
    if (!courseId) {
      alert('Please enter a course ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          targets: [{ type: 'group', ref: 'all' }],
          dueAt: dueAt || null
        })
      });

      if (response.ok) {
        alert('Assignment created successfully!');
        setCourseId('');
        setDueAt('');
      } else {
        alert('Failed to create assignment. Please try again.');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-6">Assign Training</h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
              Course ID
            </label>
            <input
              id="courseId"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter course ID"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="dueAt" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Optional)
            </label>
            <input
              id="dueAt"
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            onClick={createAssignment}
            disabled={!courseId || loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Assignment Details</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Target: All users in tenant</li>
            <li>• Status: Active immediately</li>
            <li>• Notifications: Enabled</li>
          </ul>
        </div>
      </div>
    </div>
  );
}