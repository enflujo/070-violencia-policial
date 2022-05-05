import React, { Component } from 'react';

export default class RepreseionMuerte extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let conteoMuertos = 0;
    this.props.eventos.forEach((evento) => (evento.category === 'Muerto' ? conteoMuertos++ : ''));
    let dias = new Date().getTime() - new Date(2021, 3, 28).getTime();
    dias = Math.ceil(dias / (1000 * 3600 * 24));

    return (
      <div>
        <h2>Cartografía de la violencia policial</h2>
        <h3 className="resaltar">REPRESIÓN Y MUERTE EN LAS CALLES DE COLOMBIA</h3>

        <p className="highlight">
          En 100 días de choques con la Policía al menos <span className="contador">{conteoMuertos + 1}</span> personas
          murieron en el contexto de las protestas contra el Gobierno de Iván Duque, desde el 28 de abril del 2021.
          Estos son los puntos con el registro audiovisual que ciudadanos compartieron en redes sociales y que
          Cerosetenta ha analizado, verificado y geolocalizado para entender mejor cómo ocurrió cada caso de agresión
          por parte de la Fuerza Pública, incluyendo los nombres de las víctimas y la descripción de los hechos.
          {/* Al menos <span className="contador">{conteoMuertos + 1}</span> personas han muerto en los últimos{' '}
          <span className="contador">{dias}</span> días en choques con la policía durante las protestas contra el
          gobierno de Iván Duque. Estos son los puntos y los videos que ayudan a entender cómo ocurrieron sus muertes.
          Además, seleccionamos algunas secuencias que demuestran el desborde de la represión y la violencia policial en
          medio del paro nacional de Colombia. */}
        </p>

        <p>
          {/* Este mapa de violencia policial se hizo con material tomado de fuentes abiertas que nuestro equipo ha podido
          verificar y geolocalizar con análisis y reportería en terreno. Este mapa se actualizará con cada nuevo caso
          que podamos verificar.{' '} */}
          <a href="https://cerosetenta.uniandes.edu.co/represion-y-muerte-mapa/" target="_blank">
            Así se hizo este trabajo.
          </a>
        </p>

        <p className="rojo">ESTE TRABAJO CONTIENE IMÁGENES DE VIOLENCIA.</p>

        <p>
          Un proyecto de: <a href="https://cerosetenta.uniandes.edu.co/">Cerosetenta</a> -{' '}
          <a href="https://www.bellingcat.com/" target="_blank">
            Bellingcat
          </a>{' '}
          -{' '}
          <a href="https://enflujo.com" target="_blank">
            EnFlujo
          </a>
        </p>

        <h3>Equipo</h3>

        <ul className="center">
          <li>Carlos Gonzales</li>
          <li>Giancarlo Fiorella</li>
          <li>Lorenzo Morales</li>
          <li>Natalia Arenas</li>
          <li>Nathan Jaccard</li>
          <li>Juan Camilo González</li>
          <li>Diego Forero</li>
          <li>Tania Tapia</li>
          <li>Manuela Saldarriaga</li>
          <li>María Fernanda Fitzgerald</li>
          <li>Ana Sophia López</li>
          <li>Goldy Levy</li>
          <li>Alejandro Gómez Dugand</li>
          <li>Antonia Bustamante</li>
          <li>Jeanniffer Pimentel</li>
          <li>Sara Cely Vélez</li>
          <li>Laura Ramos Rico</li>
          <li>Sandrine Exil</li>
          <li>Juan Belleville</li>
          <li>Carlos Borda</li>
          <li>Juan Felipe Rozo</li>
          <li>Mariana Ramos Abello</li>
          <li>Javier Morales Cifuentes</li>
          <li>Valeria M.</li>
          <li>Alejandro Barragán</li>
        </ul>
      </div>
    );
  }
}
