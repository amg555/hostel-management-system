// frontend/app/(dashboard)/admin/rooms/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { RoomTable } from '@/components/admin/RoomTable'
import { AddRoomModal } from '@/components/admin/AddRoomModal'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function RoomsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: rooms, isLoading, refetch } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await api.get('/rooms')
      return response.data
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Rooms</p>
          <p className="text-2xl font-bold">{rooms?.statistics?.totalRooms || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Capacity</p>
          <p className="text-2xl font-bold">{rooms?.statistics?.totalCapacity || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Occupied</p>
          <p className="text-2xl font-bold text-blue-600">{rooms?.statistics?.totalOccupied || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-2xl font-bold text-green-600">
            {(rooms?.statistics?.totalCapacity || 0) - (rooms?.statistics?.totalOccupied || 0)}
          </p>
        </div>
      </div>

      <RoomTable 
        rooms={rooms?.rooms || []} 
        isLoading={isLoading} 
        onRefresh={refetch}
      />

      <AddRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false)
          refetch()
        }}
      />
    </div>
  )
}