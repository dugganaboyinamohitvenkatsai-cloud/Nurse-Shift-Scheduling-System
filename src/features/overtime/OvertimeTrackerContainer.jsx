import React, { useState, useEffect } from 'react';
import { fetchOvertimeData } from '../../services/api';
import OvertimeDashboard from './OvertimeDashboard';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const OvertimeTrackerContainer = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchOvertimeData();
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch overtime data');
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <SkeletonLoader className="h-12 w-64 bg-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonLoader className="h-32 rounded-xl bg-gray-200" />
          <SkeletonLoader className="h-32 rounded-xl bg-gray-200" />
          <SkeletonLoader className="h-32 rounded-xl bg-gray-200" />
        </div>
        <SkeletonLoader className="h-96 rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return <OvertimeDashboard data={data} />;
};

export default OvertimeTrackerContainer;
