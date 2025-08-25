import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    quote: "Ankilang a révolutionné ma façon d'apprendre le catalan.",
    author: "Maria, Professeure de langues"
  },
  {
    id: 2,
    quote: "L'export vers Anki est parfait, ça me fait gagner des heures.",
    author: "Thomas, Étudiant"
  },
  {
    id: 3,
    quote: "L'occitan gratuit, c'est un vrai plus pour notre communauté.",
    author: "Pierre, Occitaniste"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="testimonials-minimal">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="testimonials-grid"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.blockquote 
              key={testimonial.id}
              className="testimonial-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <p className="testimonial-quote">"{testimonial.quote}"</p>
              <cite className="testimonial-author">— {testimonial.author}</cite>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
