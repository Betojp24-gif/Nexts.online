import { Product } from '../types';
import { COURSES } from '../constants';

export const INITIAL_PRODUCTS: Product[] = COURSES.map(course => {
  const extraText = course.hours === 400
    ? ' Se cursa y rinde de forma libre y flexible a tu propio ritmo (cursas libremente), con una duración ajustable desde 1 mes hasta un año de acuerdo a tus tiempos. El certificado final está oficialmente avalado por la Ley de Educación Nacional.'
    : ' Cursas libremente a tu propio ritmo y rindes de forma flexible, pudiendo durar de 1 mes a un año. Certificado avalado por la Ley de Educación Nacional.';
  
  return {
    id: course.id,
    name: course.title,
    description: `${course.objective} ${course.summary}${extraText}`,
    price: course.price,
    category: course.category,
    brand: 'Next.ar Instituto',
    ageRange: `${course.hours} horas / Certificado`,
    image: course.image,
    stock: 999, // Unlimited stock for digital courses
    popular: course.id === 'asistente-contable' || course.id === 'tecnico-computacion' || course.id === 'acompanante-terapeutico'
  };
});

export function getProductImage(item: { id: string; image: string }): string {
  return item.image;
}
