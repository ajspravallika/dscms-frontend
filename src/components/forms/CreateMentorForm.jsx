import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorBanner from '../common/ErrorBanner';

// Fields mirror src/validators/user.validator.js createMentorValidator exactly:
// name (required), email (required, @svecw.edu.in), department, designation,
// employeeId, phone (all optional).
export default function CreateMentorForm({ onSubmit, isSubmitting, error }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    employeeId: '',
    phone: '',
  });

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input label="Full name" name="name" value={form.name} onChange={handleChange('name')} required />
      <Input
        label="College email"
        name="email"
        type="email"
        placeholder="mentor@svecw.edu.in"
        value={form.email}
        onChange={handleChange('email')}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Department" name="department" value={form.department} onChange={handleChange('department')} />
        <Input label="Designation" name="designation" value={form.designation} onChange={handleChange('designation')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Employee ID" name="employeeId" value={form.employeeId} onChange={handleChange('employeeId')} />
        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange('phone')} />
      </div>

      {error && <ErrorBanner message={error} />}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Create mentor account
      </Button>
    </form>
  );
}
