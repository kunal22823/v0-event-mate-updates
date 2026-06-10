import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/client'
import EventForm from '../../components/EventForm'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ArrowLeft } from 'lucide-react'

export default function EditEvent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await apiClient.get(`/events/${id}`)
        const eventData = res.data

        // Check if user is the event creator
        if (eventData.createdBy?._id !== user?.id && user?.role !== 'superadmin') {
          toast.error('You are not authorized to edit this event.')
          navigate('/member/my-events')
          return
        }

        setEvent(eventData)
      } catch (error) {
        console.error('Failed to fetch event:', error)
        toast.error(error.response?.data?.message || 'Failed to load event.')
        navigate('/member/my-events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id, user, navigate])

  const handleSubmit = async (formData) => {
    setSubmitting(true)
    try {
      await apiClient.put(`/events/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Event updated successfully!')
      navigate(`/member/events/${id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update event.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  if (!event) {
    return (
      <div className="card p-8 text-center text-slate-500">
        Event not found.{' '}
        <Link to="/member/my-events" className="text-primary-600 font-medium hover:underline">
          Go back
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <Link
        to={`/member/events/${id}`}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Event
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Event</h1>
        <p className="text-slate-500 mt-1">Update event details</p>
      </div>

      <div className="card p-6">
        <EventForm
          initialData={event}
          onSubmit={handleSubmit}
          loading={submitting}
          submitLabel="Update Event"
        />
      </div>
    </div>
  )
}
