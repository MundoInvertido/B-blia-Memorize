import { BookOpen, Target, Heart, Star, Github } from 'lucide-react';
import { firebaseConfigurado } from '../lib/firebase';

export default function VistaSobre() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-8 shadow-lg text-center">
        <BookOpen size={48} className="mx-auto mb-4 opacity-90" />
        <h1 className="text-3xl font-black mb-2">MemoBíblia</h1>
        <p className="text-blue-100 text-base leading-relaxed">
          Um projeto dedicado a ajudar pessoas a memorizar a Palavra de Deus
          de forma progressiva, gamificada e eficiente.
        </p>
      </div>

      {/* Objetivo */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">Objetivo</h2>
        </div>
        <p className="text-slate-600 leading-relaxed">
          O <strong>MemoBíblia</strong> nasceu com um propósito simples e poderoso:
          <em> levar pessoas a memorizar a Bíblia</em>. Acreditamos que guardar a
          Palavra de Deus no coração transforma vidas, fortalece a fé e equipa o
          crente para cada desafio do dia a dia.
        </p>
        <p className="text-slate-600 leading-relaxed mt-3">
          Usando o método de <strong>repetição espaçada (SRS)</strong>, o app
          apresenta cada versículo no momento certo para maximizar a retenção —
          da mesma forma que grandes estudantes aprendem idiomas.
        </p>
      </div>

      {/* Funcionalidades */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={20} className="text-yellow-500" />
          <h2 className="text-lg font-bold text-slate-800">Como funciona</h2>
        </div>
        <ul className="space-y-2 text-slate-600 text-sm">
          {[
            '📖 Adicione versículos de qualquer tradução da Bíblia',
            '🧠 Pratique com 5 modos progressivos de memorização',
            '🔄 Revisão espaçada inteligente — cada versículo volta no momento certo',
            '🏆 Sistema de XP, níveis e conquistas para manter a motivação',
            '🔥 Streak diário para criar um hábito consistente',
            '📱 Funciona como app Android (APK) e no navegador',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Criador */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart size={20} className="text-rose-500" />
          <h2 className="text-lg font-bold text-slate-800">Sobre o Criador</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
            N
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg">Nathanael Lacerda</p>
            <p className="text-slate-500 text-sm mt-0.5">
              Desenvolvedor e cristão apaixonado por unir tecnologia e fé.
            </p>
          </div>
        </div>
        <p className="text-slate-600 text-sm mt-4 leading-relaxed">
          "Guardei as tuas palavras em meu coração, para não pecar contra ti."
          — <em>Salmos 119:11</em>
        </p>
      </div>

      {/* Status Firebase */}
      <div className={`rounded-2xl p-4 text-sm text-center ${
        firebaseConfigurado
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}>
        {firebaseConfigurado
          ? '✅ Sincronização em nuvem ativa — seus dados são salvos permanentemente.'
          : '⚠️ Dados salvos localmente. Configure o Firebase para salvar na nuvem.'}
      </div>

      {/* GitHub */}
      <div className="text-center pb-4">
        <a
          href="https://github.com/MundoInvertido/B-blia-Memorize"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm transition"
        >
          <Github size={16} /> Código aberto no GitHub
        </a>
      </div>
    </div>
  );
}
