import { useState, useEffect } from 'react';
import { Bell, ShieldCheck, Target, Play, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

export default function VistaConfiguracoes({ usuario, onVoltar, versiculos = [], totalPraticas = 0 }) {
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(false);
  const [horaLembrete, setHoraLembrete] = useState('20:00');
  const [metaDiaria, setMetaDiaria] = useState(3);
  
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [permissoesAtivas, setPermissoesAtivas] = useState(false);
  const [historicoLogs, setHistoricoLogs] = useState([]);

  const isNative = Capacitor.isNativePlatform();

  // Load configuration from local preferences
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        const metaStr = localStorage.getItem(`memo_biblia_meta_${usuario.id}`) || '3';
        setMetaDiaria(parseInt(metaStr));

        if (isNative) {
          // Check permissions
          const perm = await LocalNotifications.checkPermissions();
          setPermissoesAtivas(perm.display === 'granted');

          // Load local notification settings
          const { value: activeVal } = await Preferences.get({ key: `notif_ativa_${usuario.id}` });
          const { value: timeVal } = await Preferences.get({ key: `notif_hora_${usuario.id}` });
          
          setNotificacoesAtivas(activeVal === 'true');
          if (timeVal) setHoraLembrete(timeVal);

          adicionarLog("Configurações nativas carregadas com sucesso.");
        } else {
          // Web fallback
          const activeVal = localStorage.getItem(`notif_ativa_${usuario.id}`) === 'true';
          const timeVal = localStorage.getItem(`notif_hora_${usuario.id}`) || '20:00';
          setNotificacoesAtivas(activeVal);
          setHoraLembrete(timeVal);
          adicionarLog("Ambiente Web detectado. Usando fallback de armazenamento local.");
        }
      } catch (err) {
        adicionarLog(`Erro ao carregar configurações: ${err.message}`, 'erro');
      }
    };

    carregarConfiguracoes();
  }, [usuario.id, isNative]);

  const adicionarLog = (texto, tipo = 'info') => {
    const hora = new Date().toLocaleTimeString('pt-BR');
    setHistoricoLogs(prev => [{ hora, texto, tipo }, ...prev].slice(0, 5));
  };

  // Ask notification permissions
  const solicitarPermissao = async () => {
    if (!isNative) {
      alert("Aviso: As notificações nativas de agendamento em segundo plano requerem execução em um celular Android/iOS.");
      return;
    }
    try {
      const res = await LocalNotifications.requestPermissions();
      const granted = res.display === 'granted';
      setPermissoesAtivas(granted);
      if (granted) {
        adicionarLog("Permissão de notificações concedida!");
      } else {
        adicionarLog("Permissão de notificações negada pelo usuário.", 'erro');
      }
    } catch (err) {
      adicionarLog(`Falha ao solicitar permissão: ${err.message}`, 'erro');
    }
  };

  // Schedule or cancel notifications
  const salvarConfiguracoes = async () => {
    setSalvando(true);
    setMensagemSucesso('');

    try {
      // Save local meta
      localStorage.setItem(`memo_biblia_meta_${usuario.id}`, metaDiaria.toString());
      
      if (isNative) {
        await Preferences.set({ key: `notif_ativa_${usuario.id}`, value: notificacoesAtivas.toString() });
        await Preferences.set({ key: `notif_hora_${usuario.id}`, value: horaLembrete });

        // Cancel previous notifications
        await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

        if (notificacoesAtivas) {
          // If no permissions, request them
          if (!permissoesAtivas) {
            const perm = await LocalNotifications.requestPermissions();
            if (perm.display !== 'granted') {
              throw new Error("Permissão de notificações não concedida.");
            }
            setPermissoesAtivas(true);
          }

          const [h, m] = horaLembrete.split(':').map(Number);

          // Schedule daily notification
          await LocalNotifications.schedule({
            notifications: [
              {
                id: 1,
                title: "Hora de memorizar a Palavra! 📖",
                body: "Reserve 5 minutinhos hoje para revisar seus versículos e manter sua ofensiva!",
                schedule: {
                  on: {
                    hour: h,
                    minute: m
                  },
                  repeats: true,
                  allowWhileIdle: true
                },
                extra: { userId: usuario.id }
              }
            ]
          });
          adicionarLog(`Lembrete diário agendado com sucesso para às ${horaLembrete}.`);
        } else {
          adicionarLog("Lembretes diários desativados e cancelados.");
        }
      } else {
        localStorage.setItem(`notif_ativa_${usuario.id}`, notificacoesAtivas.toString());
        localStorage.setItem(`notif_hora_${usuario.id}`, horaLembrete);
        adicionarLog("Ajustes salvos no navegador (Notificações nativas pendentes de ambiente mobile).");
      }

      // Synchronize database to Preferences for redundancy
      await sincronizarBackupRedundante();

      setMensagemSucesso('✅ Configurações salvas com sucesso!');
      setTimeout(() => setMensagemSucesso(''), 3000);
    } catch (err) {
      adicionarLog(`Erro ao salvar: ${err.message}`, 'erro');
      alert(`Erro ao salvar configurações: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  };

  // Local storage redundancy fallback (Capacitor Preferences)
  const sincronizarBackupRedundante = async () => {
    try {
      const versiculosKey = `memo_biblia_v1_${usuario.id}`;
      const dados = localStorage.getItem(versiculosKey);
      
      if (isNative && dados) {
        await Preferences.set({
          key: `backup_seguro_${usuario.id}`,
          value: dados
        });
        adicionarLog("Backup redundante sincronizado no Capacitor Preferences.");
      }
    } catch (err) {
      adicionarLog(`Falha no backup local redundante: ${err.message}`, 'erro');
    }
  };

  // Immediate Test Notification
  const dispararNotificacaoTeste = async () => {
    if (!isNative) {
      alert("Para disparar notificações de teste no Android, execute o aplicativo no celular.");
      return;
    }

    try {
      if (!permissoesAtivas) {
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display !== 'granted') {
          alert("Por favor, conceda permissão de notificações primeiro.");
          return;
        }
        setPermissoesAtivas(true);
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 999,
            title: "Bíblia Memorize: Teste de Lembrete! 🎉",
            body: "Parabéns! Sua integração nativa com o Android está funcionando perfeitamente.",
            schedule: { at: new Date(Date.now() + 1000) } // 1 second from now
          }
        ]
      });

      adicionarLog("Notificação de teste agendada para disparar em 1 segundo!");
    } catch (err) {
      adicionarLog(`Erro no teste de notificação: ${err.message}`, 'erro');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Voltar button */}
      <button
        onClick={onVoltar}
        className="text-blue-600 font-medium flex items-center gap-1 hover:underline"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div>
        <h2 className="text-2xl font-black text-slate-800">Configurações e Integração</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Gerencie recursos nativos do Android e ajustes inspirados no Remember Me.
        </p>
      </div>

      {mensagemSucesso && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl p-4 flex items-center gap-2 shadow-sm font-semibold transition-all">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* 1. Lembrete Diário (Notificações Locais) */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Notificações e Lembrete Diário</h3>
            <p className="text-xs text-slate-400">Agende revisões para não quebrar sua ofensiva.</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-700">Lembrete Diário Ativo</label>
            <input
              type="checkbox"
              checked={notificacoesAtivas}
              onChange={(e) => setNotificacoesAtivas(e.target.checked)}
              className="w-10 h-6 bg-slate-200 rounded-full appearance-none checked:bg-blue-600 relative transition duration-300 cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-4 before:transition"
            />
          </div>

          {/* Time Picker */}
          {notificacoesAtivas && (
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-600">Horário da Revisão</span>
              <input
                type="time"
                value={horaLembrete}
                onChange={(e) => setHoraLembrete(e.target.value)}
                className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Permissions Warning/Request */}
          {isNative && !permissoesAtivas && (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl p-4 flex gap-3 items-start">
              <AlertCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs space-y-1.5">
                <p className="font-bold">Permissão de notificações desabilitada</p>
                <p className="text-amber-700 leading-normal">
                  Para que os lembretes funcionem em segundo plano, conceda permissão de notificação para o Bíblia Memorize.
                </p>
                <button
                  onClick={solicitarPermissao}
                  className="bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-amber-700 transition"
                >
                  Conceder Permissão
                </button>
              </div>
            </div>
          )}

          {/* Test Trigger */}
          <div className="pt-2">
            <button
              onClick={dispararNotificacaoTeste}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
            >
              <Play size={12} />
              Enviar Notificação de Teste
            </button>
          </div>
        </div>
      </section>

      {/* 2. Segurança e Backup Seguro */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Integridade e Proteção de Dados</h3>
            <p className="text-xs text-slate-400">Nenhum dado é perdido caso o Android faça limpeza.</p>
          </div>
        </div>

        <div className="text-xs text-slate-500 leading-normal space-y-2">
          <p>
            O Android pode limpar o <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">localStorage</code> do WebView em condições de bateria baixa ou pouco espaço de armazenamento.
          </p>
          <p className="font-medium text-slate-600">
            ✓ Nós resolvemos isso implementando um fallback seguro via <strong className="text-slate-800">Capacitor Preferences</strong>, que armazena os versículos diretamente no banco nativo do celular.
          </p>
        </div>

        <div className="pt-1 flex gap-2">
          <button
            onClick={sincronizarBackupRedundante}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition border border-emerald-100"
          >
            <RefreshCw size={12} />
            Sincronizar Backup Local Manual
          </button>
        </div>
      </section>

      {/* 3. Metas de Memorização */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Target size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Metas Diárias de Prática</h3>
            <p className="text-xs text-slate-400">Ajuste seu ritmo ideal de estudo e lembretes.</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <label className="text-sm font-bold text-slate-700">Meta Diária (Práticas)</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMetaDiaria(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50"
            >
              -
            </button>
            <span className="font-black text-slate-800 text-base w-6 text-center">{metaDiaria}</span>
            <button
              onClick={() => setMetaDiaria(prev => Math.min(10, prev + 1))}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50"
            >
              +
            </button>
          </div>
        </div>
      </section>

      {/* 4. Logs de Integração */}
      <section className="bg-slate-900 text-slate-300 rounded-3xl p-5 space-y-3 font-mono text-[11px] shadow-inner">
        <div className="flex justify-between items-center text-white border-b border-slate-800 pb-1.5">
          <span className="font-bold text-xs uppercase tracking-wider">Console de Integração</span>
          <span className="text-[10px] text-slate-500">{isNative ? '📱 Android Nativo' : '💻 Web Browser'}</span>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {historicoLogs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-slate-500">[{log.hora}]</span>
              <span className={log.tipo === 'erro' ? 'text-red-400 font-bold' : 'text-slate-300'}>
                {log.texto}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Salvar Actions */}
      <div className="pt-2 flex justify-end gap-3">
        <button
          onClick={onVoltar}
          className="px-6 py-3 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold rounded-2xl text-sm transition"
        >
          Cancelar
        </button>
        <button
          onClick={salvarConfiguracoes}
          disabled={salvando}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-md transition disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}
