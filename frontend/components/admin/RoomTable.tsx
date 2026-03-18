// frontend/components/admin/RoomTable.tsx
import React, { useState } from 'react';
import { api } from '@/lib/api';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: string;
  capacity: number;
  currentOccupancy: number;
  monthlyRent: number;
  status: string;
}

interface RoomTableProps {
  rooms: Room[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const RoomTable: React.FC<RoomTableProps> = ({ rooms, isLoading, onRefresh }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Room>>({});

  const handleDelete = async (roomId: string, roomNumber: string) => {
    if (!confirm(`Are you sure you want to delete room ${roomNumber}?`)) {
      return;
    }

    setDeletingId(roomId);
    try {
      await api.delete(`/rooms/${roomId}`);
      alert('Room deleted successfully');
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete room');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setEditFormData({
      roomNumber: room.roomNumber,
      floor: room.floor,
      type: room.type,
      capacity: room.capacity,
      monthlyRent: room.monthlyRent,
      status: room.status
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRoom) return;

    try {
      await api.put(`/rooms/${editingRoom.id}`, editFormData);
      alert('Room updated successfully');
      setEditingRoom(null);
      setEditFormData({});
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('Update error:', error);
      alert(error.response?.data?.message || 'Failed to update room');
    }
  };

  const handleCancelEdit = () => {
    setEditingRoom(null);
    setEditFormData({});
  };

  if (isLoading) {
    return <div className="p-6">Loading rooms...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Room Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Floor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Occupancy
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monthly Rent
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rooms.map((room) => (
            <tr key={room.id}>
              {editingRoom?.id === room.id ? (
                // Edit mode
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={editFormData.roomNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, roomNumber: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={editFormData.floor}
                      onChange={(e) => setEditFormData({ ...editFormData, floor: parseInt(e.target.value) })}
                      className="w-20 px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={editFormData.type}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                      className="px-2 py-1 border rounded"
                    >
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                      <option value="dormitory">Dormitory</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={editFormData.capacity}
                      onChange={(e) => setEditFormData({ ...editFormData, capacity: parseInt(e.target.value) })}
                      className="w-20 px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={editFormData.monthlyRent}
                      onChange={(e) => setEditFormData({ ...editFormData, monthlyRent: parseFloat(e.target.value) })}
                      className="w-24 px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="px-2 py-1 border rounded"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={handleSaveEdit}
                      className="text-green-600 hover:text-green-900 mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                // View mode
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {room.roomNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {room.floor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {room.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {room.currentOccupancy}/{room.capacity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{room.monthlyRent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      room.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : room.status === 'occupied'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(room)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(room.id, room.roomNumber)}
                      disabled={deletingId === room.id || room.currentOccupancy > 0}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={room.currentOccupancy > 0 ? "Cannot delete room with students" : "Delete"}
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {rooms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No rooms found
        </div>
      )}
    </div>
  );
};