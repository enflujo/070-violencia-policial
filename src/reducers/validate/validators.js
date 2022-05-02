import eventSchema from './schemas/event';
import { calcDatetime, isValidDate } from '../../common/utilities';
import lugarSchema from './schemas/lugar';

/**
 * Limpia los datos que llegan del API y descarta todos los items que no pasen la validación.
 *
 * @param {Object} domain Datos agregados de los diferentes endpoints del API.
 * @returns Datos que pasan validación.
 */
export function validateDomain(domain) {
  // La nueva estructura sólo con datos validados. Esta es la que devuelve la función.
  const sanitizedDomain = {
    events: [],
    categories: [],
    estanDisparando: {
      eventos: [],
      categorias: [],
      cais: [],
    },
    represionMuerte: {
      eventos: [],
      categorias: [],
    },
  };

  // Si no hay datos del API, salir de acá inmediatamente y devolver los arrays vacíos.
  if (domain === undefined) {
    return sanitizedDomain;
  }

  // Acumula los errores que se van generando para luego imprimirlos en la consola.
  const errors = [];

  const validarEventos = (llaveHistoria) => {
    domain[llaveHistoria].eventos.forEach((evento, idx) => {
      if (eventSchema(evento, { errors })) {
        // Acumular las categorías que si se usan en los eventos.
        const listaCategorias = sanitizedDomain[llaveHistoria].categorias;

        const categoriaUsada = listaCategorias.find(({ category }) => evento.category === category);
        if (!categoriaUsada) listaCategorias.push({ category: evento.category });

        // Darle un id único a cada evento.
        evento.id = idx;
        // Crear un nuevo campo con fecha valida de JS.
        evento.datetime = calcDatetime(evento.date, evento.time);

        // Si no logra generar una fecha valida, sumar a los errores y eliminar evento del array.
        if (!isValidDate(new Date(evento.datetime))) {
          errors.push(`Invalid date (${evento.date}) in event with description: ${evento.description}`);
        } else {
          sanitizedDomain[llaveHistoria].eventos.push(evento);
        }
      }
    });
  };

  // Ejecutar validaciones
  validarEventos('estanDisparando');
  validarEventos('represionMuerte');

  sanitizedDomain.estanDisparando.eventos.sort((a, b) => a.datetime - b.datetime);
  sanitizedDomain.represionMuerte.eventos.sort((a, b) => a.datetime - b.datetime);

  sanitizedDomain.estanDisparando.cais = domain.estanDisparando.cais.filter((cai) => {
    if (lugarSchema(cai, { errors })) {
      return true;
    }
    return false;
  });

  // Imprimir errores acumulados en el proceso.
  if (errors.length) {
    console.error(`Validation errors:\n${errors.join(`\n`)}`);
  }
  return sanitizedDomain;
}
