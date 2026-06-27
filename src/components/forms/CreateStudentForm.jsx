import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import ErrorBanner from '../common/ErrorBanner';

// Fields mirror src/validators/user.validator.js createStudentValidator exactly:
// name (required), email (required, @svecw.edu.in), rollNumber (required),
// department, year (1-4), section, parentContact, phone (all optional).
const YEAR_OPTIONS = [1, 2, 3, 4].map((y) => ({ value: String(y), label: `Year ${y}` }));

export default function CreateStudentForm({ onSubmit, isSubmitting, error }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    department: '',
    year: '',
    section: '',
    parentContact: '',
    phone: '',
  });

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.year) payload.year = Number(payload.year);
    else delete payload.year;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input label="Full name" name="name" value={form.name} onChange={handleChange('name')} required />
      <Input
        label="College email"
        name="email"
        type="email"
        placeholder="student@svecw.edu.in"
        value={form.email}
        onChange={handleChange('email')}
        required
      />
      <Input
        label="Roll number"
        name="rollNumber"
        value={form.rollNumber}
        onChange={handleChange('rollNumber')}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Department" name="department" value={form.department} onChange={handleChange('department')} />
        <Select
          label="Year"
          name="year"
          placeholder="Select year"
          options={YEAR_OPTIONS}
          value={form.year}
          onChange={handleChange('year')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Section" name="section" value={form.section} onChange={handleChange('section')} />
        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange('phone')} />
      </div>
      <Input
        label="Parent contact"
        name="parentContact"
        value={form.parentContact}
        onChange={handleChange('parentContact')}
      />

      {error && <ErrorBanner message={error} />}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Create student account
      </Button>
    </form>
  );
}
