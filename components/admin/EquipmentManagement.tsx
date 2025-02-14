import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Status } from '@prisma/client';
import { showToast } from '@/utils/notifications';
import { Equipment, Category } from '@/types';
import ReactPaginate from 'react-paginate';

interface FormData {
  name: string;
  description: string;
  imageUrl?: string;
  location: string;
  categoryId: string;
  status: Status;
  availability: boolean;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  location: '',
  categoryId: '',
  status: 'AVAILABLE',
  availability: true,
};

const EquipmentManagement: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/admin/equipment/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      const { imageUrl } = await response.json();
      setFormData((prev) => ({ ...prev, imageUrl }));
      showToast('Image uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Failed to upload image', 'error');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  useEffect(() => {
    fetchEquipment();
    fetchCategories();
  }, [currentPage, filter, searchTerm]);

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: (currentPage + 1).toString(),
        limit: '10',
        status: filter !== 'ALL' ? filter : '',
        search: searchTerm,
      });

      const response = await fetch(`/api/admin/equipment?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch equipment');
      }

      const data = await response.json();
      setEquipment(data.items || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      showToast('Failed to fetch equipment', 'error');
      setEquipment([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('Failed to fetch categories', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = selectedEquipment
        ? `/api/admin/equipment/${selectedEquipment.id}`
        : '/api/admin/equipment';
      
      const method = selectedEquipment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save equipment');

      showToast(
        `Equipment ${selectedEquipment ? 'updated' : 'created'} successfully`,
        'success'
      );
      setFormData(initialFormData);
      setSelectedEquipment(null);
      setShowAddForm(false);
      fetchEquipment();
    } catch (error) {
      console.error('Error saving equipment:', error);
      showToast('Failed to save equipment', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;

    try {
      const response = await fetch(`/api/admin/equipment/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete equipment');

      showToast('Equipment deleted successfully', 'success');
      fetchEquipment();
    } catch (error) {
      console.error('Error deleting equipment:', error);
      showToast('Failed to delete equipment', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <div className="container-fluid p-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              {selectedEquipment ? 'Edit Equipment' : 'Add New Equipment'}
            </h5>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowAddForm(false);
                setSelectedEquipment(null);
                setFormData(initialFormData);
              }}
            >
              Back to List
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-control"
                    rows={3}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                    className="form-select"
                    required
                  >
                    {Object.values(Status).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Image</label>
                  <div
                    {...getRootProps()}
                    className={`border border-2 border-dashed rounded p-4 text-center ${
                      isDragActive ? 'border-primary bg-light' : 'border-secondary'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <p className="mb-0">Drop the image here ...</p>
                    ) : (
                      <div>
                        <p className="mb-0">Drag and drop an image here, or click to select</p>
                        <small className="text-muted">Supports: JPG, JPEG, PNG, GIF</small>
                      </div>
                    )}
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.imageUrl}
                        alt="Equipment preview"
                        style={{ height: '8rem', objectFit: 'contain' }}
                        className="rounded"
                      />
                    </div>
                  )}
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary">
                    {selectedEquipment ? 'Update Equipment' : 'Add Equipment'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as Status | 'ALL')}
                className="form-select"
                style={{ width: 'auto' }}
              >
                <option value="ALL">All Status</option>
                {Object.values(Status).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ width: 'auto' }}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              Add New Equipment
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {equipment.length === 0 ? (
            <p className="text-center text-muted py-4">No equipment found</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Location</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{ height: '3rem', width: '3rem', objectFit: 'cover' }}
                            className="rounded"
                          />
                        )}
                      </td>
                      <td>{item.name}</td>
                      <td>{item.description}</td>
                      <td>{item.location}</td>
                      <td>{item.category?.name}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            item.status === 'AVAILABLE'
                              ? 'success'
                              : item.status === 'IN_USE'
                              ? 'warning'
                              : 'danger'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            onClick={() => {
                              setSelectedEquipment(item);
                              setFormData({
                                name: item.name,
                                description: item.description || '',
                                imageUrl: item.imageUrl || undefined,
                                location: item.location || '',
                                categoryId: item.categoryId,
                                status: item.status,
                                availability: item.availability,
                              });
                              setShowAddForm(true);
                            }}
                            className="btn btn-sm btn-primary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-sm btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <ReactPaginate
              previousLabel={'Previous'}
              nextLabel={'Next'}
              breakLabel={'...'}
              pageCount={totalPages}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={({ selected }) => setCurrentPage(selected)}
              containerClassName={'pagination justify-content-center mt-4'}
              pageClassName={'page-item'}
              pageLinkClassName={'page-link'}
              previousClassName={'page-item'}
              previousLinkClassName={'page-link'}
              nextClassName={'page-item'}
              nextLinkClassName={'page-link'}
              breakClassName={'page-item'}
              breakLinkClassName={'page-link'}
              activeClassName={'active'}
              disabledClassName={'disabled'}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentManagement;
