'use client'

import { useState } from 'react'
import { Plus, Edit2, X, Globe, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { addCharity, updateCharity } from './actions'

type Charity = {
  id: string
  name: string
  category: string
  country: string
  website_url: string
  is_featured: boolean
  is_active: boolean
  created_at: string
}

export function CharitiesClient({ initialCharities }: { initialCharities: Charity[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenModal = (charity?: Charity) => {
    setEditingCharity(charity || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCharity(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    // Explicitly set boolean fields if they are missing from unchecked checkboxes
    if (!formData.has('is_featured')) formData.set('is_featured', 'false')
    if (!formData.has('is_active')) formData.set('is_active', 'false')

    try {
      if (editingCharity) {
        formData.set('id', editingCharity.id)
        await updateCharity(formData)
      } else {
        await addCharity(formData)
      }
      handleCloseModal()
    } catch (error) {
      console.error(error)
      alert("Failed to save charity")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-cream)', marginBottom: '8px' }}>🎗️ Charities</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Manage available charities and their details.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: 'none', borderRadius: '8px', background: 'var(--color-gold)', color: '#000', cursor: 'pointer', fontWeight: 600 }}
        >
          <Plus size={18} />
          Add Charity
        </button>
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Country</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Added</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialCharities.map((c) => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--color-cream)', fontWeight: 500 }}>
                    {c.name}
                    {c.website_url && (
                      <a href={c.website_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-gold)', marginTop: '4px', textDecoration: 'none' }}>
                        <Globe size={12} /> Visit website
                      </a>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.category || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.country || '—'}</td>
                  <td>
                    <span className={`badge ${c.is_featured ? 'badge-gold' : 'badge-gray'}`}>
                      {c.is_featured ? 'Featured' : 'Standard'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.is_active ? 'badge-green' : 'badge-red'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {new Date(c.created_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleOpenModal(c)}
                      style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      title="Edit Charity"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {initialCharities.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                    No charities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass"
              style={{ position: 'relative', width: '100%', maxWidth: '500px', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--color-cream)', margin: 0 }}>
                  {editingCharity ? 'Edit Charity' : 'Add New Charity'}
                </h2>
                <button type="button" onClick={handleCloseModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="name" style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Charity Name</label>
                  <input 
                    id="name" 
                    name="name" 
                    required 
                    defaultValue={editingCharity?.name}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', color: 'var(--color-cream)', outline: 'none' }} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="category" style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Category <Tag size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.5 }} /></label>
                  <input 
                    id="category" 
                    name="category"
                    defaultValue={editingCharity?.category}
                    placeholder="e.g. Health, Education, Environment"
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', color: 'var(--color-cream)', outline: 'none' }} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="website_url" style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Website URL <Globe size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.5 }} /></label>
                  <input 
                    id="website_url" 
                    name="website_url" 
                    type="url"
                    defaultValue={editingCharity?.website_url}
                    placeholder="https://..."
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', color: 'var(--color-cream)', outline: 'none' }} 
                  />
                </div>

                <div style={{ display: 'flex', gap: '24px', marginTop: '8px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--color-cream)' }}>
                    <input 
                      type="checkbox" 
                      name="is_featured" 
                      value="true" 
                      defaultChecked={editingCharity ? editingCharity.is_featured : false} 
                      style={{ accentColor: 'var(--color-gold)', width: '16px', height: '16px' }}
                    />
                    Featured
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--color-cream)' }}>
                    <input 
                      type="checkbox" 
                      name="is_active" 
                      value="true" 
                      defaultChecked={editingCharity ? editingCharity.is_active : true} 
                      style={{ accentColor: 'var(--color-gold)', width: '16px', height: '16px' }}
                    />
                    Active
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  <button type="button" onClick={handleCloseModal} style={{ padding: '10px 16px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} style={{ padding: '10px 24px', background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Saving...' : 'Save Charity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
