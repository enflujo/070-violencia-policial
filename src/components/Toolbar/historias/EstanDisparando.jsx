import React, { Component } from 'react';

export default class EstanDispando extends Component {
  render() {
    return (
      <div>
        <h2>Cartografía de la violencia policial</h2>
        <h3 className="resaltar">
          ¡Están disparando!: los puntos donde la policía desenfundó sus armas en el #9S y #10S
        </h3>
        <p className="highlight">
          Periodistas de 070 geolocalizaron videos donde hay evidencia de uso de armas de fuego durante las protestas
          del 9 y 10 de septiembre de 2020 en Bogotá y Soacha. Esas noches, por balas, murieron 14 personas y 75
          quedaron heridas, según reportes de hospitales.
        </p>
        <p>
          Cada punto en el mapa corresponde al lugar en el que un video registra a un agente de policía disparando; se
          oyen detonaciones en presencia de policías; o se oyen detonaciones pero no se identifica el origen.
        </p>
        <p>
          El análisis muestra que — con certeza— la policía disparó al menos 345 veces sus armas de fuego en los
          alrededores de 17 CAI de la ciudad. En otras 1116 detonaciones registradas no hay imagen de la policía
          disparando, aunque en la mayoría de esos eventos se ve su presencia.
        </p>
        <p>El análisis visual o sonoro no permite identificar el tipo de munición o arma utilizada.</p>
        <p className="resaltar">Este mapa sigue abierto y se irá alimentando con nuevos registros.</p>

        <h3>Créditos</h3>
        <p>
          Investigación de fuente abierta y análisis por <a href="https://cerosetenta.uniandes.edu.co/">Cerosetenta</a>.
        </p>
        <p>
          Desarrollo{' '}
          <a href="https://enflujo.com" target="_blank">
            Laboratorio EnFlujo
          </a>
        </p>
        <p>
          Software y espacialización por{' '}
          <a href="https://forensic-architecture.org/" target="_blank">
            Forensic Architecture
          </a>
          .
        </p>
        <p>
          Asesoría editorial por{' '}
          <a href="https://www.bellingcat.com/" target="_blank">
            Bellingcat
          </a>
          .
        </p>
      </div>
    );
  }
}
