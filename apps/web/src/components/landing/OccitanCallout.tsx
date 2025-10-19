import OcFlag from '../../assets/flags/oc.svg'

export default function OccitanCallout() {
  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="inline-flex items-center gap-3 mb-4">
          <img 
            src={OcFlag} 
            alt="Drapeau occitan" 
            className="w-8 h-6 rounded shadow-sm"
          />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Ankilang soutient l'apprentissage de l'occitan
          </h2>
        </div>
        <div className="accent-bar mx-auto mb-6" />
      </div>
      
      <div className="max-w-3xl mx-auto space-y-6 text-lg text-gray-700 leading-relaxed">
        <p>
          L'occitan est une langue romane millénaire, témoin vivant de notre patrimoine culturel. 
          À travers les siècles, elle a façonné l'identité et la culture de l'Occitanie, 
          transmettant des traditions, des récits et une vision du monde unique.
        </p>
        
        <p>
          Ankilang s'engage à préserver et transmettre cette richesse linguistique. 
          Nos flashcards en occitan sont entièrement gratuites, permettant à chacun 
          de découvrir et maîtriser cette langue de manière accessible et efficace.
        </p>
        
        <p>
          Rejoignez notre communauté d'apprenants et contribuez à maintenir vivant 
          ce patrimoine linguistique exceptionnel.
        </p>
      </div>
      
      <div className="mt-8">
        <a
          href="/app/community?lang=oc"
          className="btn-primary min-h-[44px] inline-flex items-center gap-2"
        >
          Découvrir les flashcards en occitan
          <span className="sr-only">Accéder aux flashcards gratuites en occitan</span>
        </a>
      </div>
    </div>
  )
}
