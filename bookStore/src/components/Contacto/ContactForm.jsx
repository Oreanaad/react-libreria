import React, { useState } from 'react';
import './ContactForm.css'; // Importa tus estilos CSS

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    service: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState(null);

  const whatsappNumber = "584142065191";
  const whatsappMessage = "Hola, me gustaría ordenar un libro";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido.';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es obligatorio.';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es obligatorio.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // --- ¡IMPORTANTE! Asegúrate de que esta URL apunte a tu backend! ---
      // Si tu backend corre en http://localhost:3001, esta es la URL correcta.
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${yourAuthToken}`, // Si usas autenticación
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSubmissionMessage({ type: 'success', text: responseData.message || '¡Mensaje enviado con éxito!' });
        setFormData({ name: '', email: '', subject: '', service: '', message: '' }); // Limpiar formulario
      } else {
        throw new Error(responseData.error || 'Error desconocido al enviar el mensaje.');
      }
    } catch (error) {
      setSubmissionMessage({ type: 'error', text: `Hubo un problema al enviar tu mensaje: ${error.message || 'Por favor, inténtalo de nuevo.'}` });
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-page-section">
      <div className="section-header-top">
        <span className="small-text-heading">AMANTES DE LOS LIBROS</span>
      </div>
      <h1 className="main-heading">¡NOS ENCANTARÍA SABER DE TI!</h1>

      <div className="contact-info-blocks">
        <div className="info-block">
          {/* <div className="info-icon"><FontAwesomeIcon icon={faPhone} /></div> */}
          <div className="info-icon">📞</div>
          <span className="info-label">Escríbenos</span>
          <a href={whatsappLink} className="info-value">+58 4145962337</a>
        </div>
        <div className="info-block">
          {/* <div className="info-icon"><FontAwesomeIcon icon={faMapMarkerAlt} /></div> */}
          <div className="info-icon">📍</div>
          <span className="info-label">Dirección</span>
          <span className="info-value">Valencia, Edo Carabobo <br/> Venezuela</span>
          <a href="https://maps.app.goo.gl/BZQWi1Cf4fhgYUvg6?g_st=iw" target="_blank" rel="noopener noreferrer" className="info-link">VER EN EL MAPA</a>
        </div>
        <div className="info-block">
          {/* <div className="info-icon"><FontAwesomeIcon icon={faEnvelope} /></div> */}
          <div className="info-icon">✉️</div>
          <span className="info-label">Email</span>
          <a href="mailto:Booksflea@gmail.com" className="info-value">Booksflea@gmail.com</a>
         
        </div>
      </div>

      <div className="contact-form-wrapper">
        <form onSubmit={handleSubmit} className="contact-main-form">

          {submissionMessage && (
            <p className={`submission-feedback ${submissionMessage.type}`}>
              {submissionMessage.text}
            </p>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Ingresa tu nombre"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'input-error' : ''}
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && <p id="name-error" className="error-message">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Ingresa tu correo electrónico"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && <p id="email-error" className="error-message">{errors.email}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="subject">Asunto</label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="Escribe el asunto"
                value={formData.subject}
                onChange={handleChange}
                className={errors.subject ? 'input-error' : ''}
                aria-invalid={errors.subject ? "true" : "false"}
                aria-describedby={errors.subject ? "subject-error" : undefined}
              />
              {errors.subject && <p id="subject-error" className="error-message">{errors.subject}</p>}
            </div>

            
          </div>

          <div className="form-group full-width">
            <label htmlFor="message">Tu Mensaje *</label>
            <textarea
              id="message"
              name="message"
              placeholder="Escribe tu mensaje aquí"
              value={formData.message}
              onChange={handleChange}
              rows="6"
              className={errors.message ? 'input-error' : ''}
              aria-invalid={errors.message ? "true" : "false"}
              aria-describedby={errors.message ? "message-error" : undefined}
            ></textarea>
            {errors.message && <p id="message-error" className="error-message">{errors.message}</p>}
          </div>

          <div className="form-group full-width">
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ContactForm;