import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxElements = () => {
  const { scrollY } = useScroll();
  
  const y1 = useTransform(scrollY, [0, 1000], [0, -100]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 50]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -75]);
  const opacity1 = useTransform(scrollY, [0, 500], [0.3, 0.8]);
  const opacity2 = useTransform(scrollY, [0, 500], [0.2, 0.6]);

  return (
    <>
      {/* Élément flottant 1 */}
      <motion.div 
        className="fixed top-20 left-10 w-20 h-20 bg-gradient-to-br from-violet-400/20 to-violet-600/20 rounded-full blur-xl pointer-events-none z-0"
        style={{ y: y1, opacity: opacity1 }}
        animate={{ 
          y: [0, -20, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Élément flottant 2 */}
      <motion.div 
        className="fixed bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-slate-400/10 to-slate-600/10 rounded-full blur-2xl pointer-events-none z-0"
        style={{ y: y2, opacity: opacity2 }}
        animate={{ 
          y: [0, 30, 0],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      {/* Élément flottant 3 */}
      <motion.div 
        className="fixed top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-violet-300/15 to-violet-500/15 rounded-full blur-lg pointer-events-none z-0"
        style={{ y: y3 }}
        animate={{ 
          y: [0, -15, 0],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </>
  );
};

export default ParallaxElements;
