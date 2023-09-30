import React, { useState } from 'react';

const DynamicForm = ({ fields, onSubmit }) => {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form onSubmit={(e) => onSubmit(e, formData)}>
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name}>{field.name}:</label>
          {field.type === 'int' ? (
            <input
              type="number"
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
            />
          ) : (
            <input
              type="text"
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
            />
          )}
        </div>
      ))}
      <button type="submit">Salvar</button>
    </form>
  );
};

export default DynamicForm;