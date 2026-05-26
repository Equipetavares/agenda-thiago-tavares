import React, { useState, useMemo, useEffect } from 'react';

export default function App() {
  // --- Estados Principais carregados do Banco de Dados Local (localStorage) ---
  
  // 1. Estado da Agenda (📅) - Inicializado totalmente vazio
  const [agendas, setAgendas] = useState(() => {
    try {
      const localData = localStorage.getItem('agendify_local_agendas');
      return localData ? JSON.parse(localData) : [];
    } catch (e) {
      console.error('Erro ao ler agendas locais:', e);
      return [];
    }
  });

  // 2. Estado do Kanban (📋) - Inicializado totalmente vazio
  const [kanbanTasks, setKanbanTasks] = useState(() => {
    try {
      const localData = localStorage.getItem('agendify_local_kanban');
      return localData ? JSON.parse(localData) : [];
    } catch (e) {
      console.error('Erro ao ler kanban local:', e);
      return [];
    }
  });

  // 3. Estado das Notas (📝) - Inicializado totalmente vazio
  const [notes, setNotes] = useState(() => {
    try {
      const localData = localStorage.getItem('agendify_local_notes');
      return localData ? JSON.parse(localData) : [];
    } catch (e) {
      console.error('Erro ao ler notas locais:', e);
      return [];
    }
  });

  // --- Sincronização Automática com o Banco de Dados Local ---
  useEffect(() => {
    localStorage.setItem('agendify_local_agendas', JSON.stringify(agendas));
  }, [agendas]);

  useEffect(() => {
    localStorage.setItem('agendify_local_kanban', JSON.stringify(kanbanTasks));
  }, [kanbanTasks]);

  useEffect(() => {
    localStorage.setItem('agendify_local_notes', JSON.stringify(notes));
  }, [notes]);

  // --- Estados de Controlo de Interface ---
  const [currentTab, setCurrentTab] = useState('dashboard'); // dashboard | calendar | kanban | notes
  const [modalType, setModalType] = useState(null); // 'agenda' | 'kanban' | 'note' | null
  const [editItem, setEditItem] = useState(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-05-26');
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 4, 1)); // Maio de 2026

  // Feedbacks visuais rápidos (sem travar a aplicação)
  const [emailStatus, setEmailStatus] = useState({ sending: false, message: '', type: '' });

  // Formulário Unificado
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    date: '2026-05-26',
    time: '12:00',
    category: 'Trabalho',
    priority: 'media',
    column: 'todo',
    sendEmail: false
  });

  // --- Simulador Local de Envio de E-mail (Seguro, Sem Erros de Conexão) ---
  const triggerEmailNotification = (agendaItem) => {
    const targetEmail = 'equipe.tavarez@gmail.com';
    setEmailStatus({ sending: true, message: 'A disparar lembrete de e-mail...', type: 'info' });

    // Simulação visual ultra rápida e realista
    setTimeout(() => {
      setEmailStatus({
        sending: false,
        message: `Lembrete agendado com sucesso para ${targetEmail}!`,
        type: 'success'
      });
      // Fecha o aviso em 4 segundos
      setTimeout(() => setEmailStatus({ sending: false, message: '', type: '' }), 4000);
    }, 1000);
  };

  // --- Operações Locais Instantâneas (Agenda) ---
  const handleToggleAgendaStatus = (id) => {
    setAgendas(prev => prev.map(a => 
      a.id === id ? { ...a, status: a.status === 'completed' ? 'pending' : 'completed' } : a
    ));
  };

  const handleOpenAddAgenda = () => {
    setFormData({
      title: '', desc: '', date: selectedCalendarDate, time: '12:00',
      category: 'Trabalho', status: 'pending', sendEmail: false
    });
    setEditItem(null);
    setModalType('agenda');
  };

  const handleOpenEditAgenda = (item) => {
    setFormData({
      title: item.title, desc: item.desc, date: item.date, time: item.time,
      category: item.category, status: item.status, sendEmail: item.sendEmail || false
    });
    setEditItem(item);
    setModalType('agenda');
  };

  const handleSaveAgenda = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newAgendaItem = {
      id: editItem ? editItem.id : Date.now().toString(),
      title: formData.title,
      desc: formData.desc,
      date: formData.date,
      time: formData.time,
      category: formData.category,
      status: editItem ? formData.status : 'pending',
      sendEmail: formData.sendEmail
    };

    if (editItem) {
      setAgendas(prev => prev.map(a => a.id === editItem.id ? newAgendaItem : a));
    } else {
      setAgendas(prev => [...prev, newAgendaItem]);
    }

    setModalType(null);

    if (formData.sendEmail) {
      triggerEmailNotification(newAgendaItem);
    }
  };

  const handleDeleteAgenda = (id) => {
    setAgendas(prev => prev.filter(item => item.id !== id));
    setModalType(null);
  };

  // --- Operações Locais Instantâneas (Kanban) ---
  const handleOpenAddKanban = () => {
    setFormData({ title: '', desc: '', priority: 'media', column: 'todo' });
    setEditItem(null);
    setModalType('kanban');
  };

  const handleOpenEditKanban = (item) => {
    setFormData({ title: item.title, desc: item.desc, priority: item.priority, column: item.column });
    setEditItem(item);
    setModalType('kanban');
  };

  const handleSaveKanban = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newTask = {
      id: editItem ? editItem.id : Date.now().toString(),
      title: formData.title,
      desc: formData.desc,
      column: formData.column,
      priority: formData.priority
    };

    if (editItem) {
      setKanbanTasks(prev => prev.map(t => t.id === editItem.id ? newTask : t));
    } else {
      setKanbanTasks(prev => [...prev, newTask]);
    }
    setModalType(null);
  };

  const handleDeleteKanban = (id) => {
    setKanbanTasks(prev => prev.filter(item => item.id !== id));
    setModalType(null);
  };

  const handleMoveKanban = (id, direction) => {
    const columns = ['todo', 'progress', 'done'];
    setKanbanTasks(prev => prev.map(t => {
      if (t.id === id) {
        const currentIndex = columns.indexOf(t.column);
        let nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < columns.length) {
          return { ...t, column: columns[nextIndex] };
        }
      }
      return t;
    }));
  };

  // --- Operações Locais Instantâneas (Notas) ---
  const handleOpenAddNote = () => {
    setFormData({ title: '', desc: '' });
    setEditItem(null);
    setModalType('note');
  };

  const handleOpenEditNote = (item) => {
    setFormData({ title: item.title, desc: item.content });
    setEditItem(item);
    setModalType('note');
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const formattedDate = new Date().toLocaleDateString('pt-PT');
    const newNote = {
      id: editItem ? editItem.id : Date.now().toString(),
      title: formData.title,
      content: formData.desc,
      date: formattedDate
    };

    if (editItem) {
      setNotes(prev => prev.map(n => n.id === editItem.id ? newNote : n));
    } else {
      setNotes(prev => [newNote, ...prev]);
    }
    setModalType(null);
  };

  const handleDeleteNote = (id) => {
    setNotes(prev => prev.filter(item => item.id !== id));
    setModalType(null);
  };

  // --- Limpar Banco de Dados Local (Reset) ---
  const handleResetDatabase = () => {
    if (window.confirm('Tem a certeza de que deseja redefinir o banco de dados local? Todos os dados serão apagados permanentemente.')) {
      localStorage.removeItem('agendify_local_agendas');
      localStorage.removeItem('agendify_local_kanban');
      localStorage.removeItem('agendify_local_notes');
      window.location.reload();
    }
  };

  // --- Métricas Auxiliares do Painel ---
  const upcomingActivities = useMemo(() => {
    const todayStr = '2026-05-26';
    return agendas
      .filter(item => item.status === 'pending' && item.date >= todayStr)
      .sort((a, b) => {
        const dateDiff = a.date.localeCompare(b.date);
        return dateDiff !== 0 ? dateDiff : a.time.localeCompare(b.time);
      })
      .slice(0, 3);
  }, [agendas]);

  const metrics = useMemo(() => {
    const pendingCount = agendas.filter(i => i.status === 'pending').length;
    const completedCount = agendas.filter(i => i.status === 'completed').length;
    const kanbanInProgress = kanbanTasks.filter(i => i.column === 'progress').length;
    return { pendingCount, completedCount, kanbanInProgress };
  }, [agendas, kanbanTasks]);

  const dynamicWarning = useMemo(() => {
    if (upcomingActivities.length === 0) {
      return "Está livre! Nenhuma atividade pendente para os próximos dias.";
    }
    const nextTask = upcomingActivities[0];
    const isToday = nextTask.date === '2026-05-26';
    return isToday 
      ? `Atenção: Próxima atividade é hoje às ${nextTask.time} - "${nextTask.title}"`
      : `Lembrete: Próximo compromisso a ${nextTask.date.split('-').reverse().slice(0,2).join('/')} às ${nextTask.time} - "${nextTask.title}"`;
  }, [upcomingActivities]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNum: d,
        dateStr: dayStr,
        hasEvents: agendas.some(a => a.date === dayStr),
        hasCompletedEventsOnly: agendas.filter(a => a.date === dayStr).length > 0 && agendas.filter(a => a.date === dayStr).every(a => a.status === 'completed')
      });
    }
    return days;
  }, [calendarMonth, agendas]);

  const changeMonth = (direction) => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const agendasForSelectedDay = useMemo(() => {
    return agendas.filter(item => item.date === selectedCalendarDate);
  }, [agendas, selectedCalendarDate]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex justify-center font-sans antialiased pb-24 md:pb-6 relative select-none">
      
      {/* Container Principal */}
      <div className="w-full max-w-md bg-slate-950 min-h-screen shadow-2xl flex flex-col relative border-x border-slate-800">
        
        {/* Banner de Feedback de Lembretes */}
        {emailStatus.message && (
          <div className={`absolute top-16 left-4 right-4 z-50 p-3.5 rounded-2xl flex items-center space-x-3 shadow-2xl border transition-all animate-slide-up ${
            emailStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' :
            emailStatus.type === 'error' ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' :
            'bg-indigo-500/10 border-indigo-500/40 text-indigo-400'
          }`}>
            <span className="text-base">
              {emailStatus.type === 'success' ? '🚀' : '✉️'}
            </span>
            <p className="text-xs font-semibold flex-1 leading-normal">{emailStatus.message}</p>
            {emailStatus.sending && (
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        )}

        {/* --- Header Principal --- */}
        <header className="sticky top-0 bg-slate-950/95 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-800/80 z-20">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30 text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">Agendify</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">SaaS Local Persistente</p>
            </div>
          </div>
          
          {/* Indicador de Status Local */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold tracking-wide text-emerald-400">
              BANCO LOCAL ATIVO
            </span>
          </div>
        </header>

        {/* --- Conteúdo Principal --- */}
        <main className="flex-1 px-5 py-6 space-y-6 overflow-y-auto">
          
          {/* ================= ABA: DASHBOARD ================= */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Card de Boas-Vindas */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 p-6 shadow-xl shadow-indigo-950/30">
                <div className="relative z-10 space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Olá, Thiago!</h2>
                    <p className="text-indigo-200 text-sm">O seu aplicativo está a funcionar 100% com banco de dados local.</p>
                  </div>
                  
                  {/* Aviso Inteligente */}
                  <div className="flex items-start space-x-3 bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-white shadow-sm">
                    <span className="text-lg">💡</span>
                    <p className="text-xs font-medium leading-relaxed">{dynamicWarning}</p>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl"></div>
              </div>

              {/* Grid de Estatísticas */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-indigo-400">{metrics.pendingCount}</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-1">Pendentes</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-emerald-400">{metrics.completedCount}</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-1">Concluídas</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-amber-400">{metrics.kanbanInProgress}</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-1">Em Kanban</span>
                </div>
              </div>

              {/* Seção das Próximas Atividades */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Próximas 3 Atividades</h3>
                  <button onClick={() => setCurrentTab('calendar')} className="text-xs font-semibold text-indigo-400">
                    Ver Agenda
                  </button>
                </div>
                
                <div className="space-y-3">
                  {upcomingActivities.length > 0 ? (
                    upcomingActivities.map(item => (
                      <div 
                        key={item.id} 
                        className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition-colors"
                        onClick={() => handleOpenEditAgenda(item)}
                      >
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className={`p-2 rounded-xl text-xs font-bold ${
                            item.category === 'Trabalho' ? 'bg-blue-500/10 text-blue-400' :
                            item.category === 'Saúde' ? 'bg-rose-500/10 text-rose-400' :
                            'bg-purple-500/10 text-purple-400'
                          }`}>
                            {item.time}
                          </div>
                          <div className="truncate">
                            <h4 className="font-bold text-slate-200 text-sm">{item.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {item.date.split('-').reverse().join('/')} • {item.category}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerEmailNotification(item);
                          }}
                          className="p-2 hover:bg-indigo-600/20 rounded-xl text-indigo-400 transition-colors"
                          title="Enviar alerta de e-mail simulado"
                        >
                          ✉️
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 text-xs">
                      Nenhum compromisso pendente de momento.
                    </div>
                  )}
                </div>
              </div>

              {/* Central de Controlo Local */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-indigo-400 font-bold block text-xs uppercase tracking-wider">Configuração do Banco Local:</span>
                <p className="text-xs text-slate-400">Os seus dados estão protegidos localmente no navegador (`localStorage`). Nenhuma informação é enviada para servidores externos.</p>
                <div className="pt-1">
                  <button 
                    onClick={handleResetDatabase}
                    className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold px-4 py-2 rounded-xl transition-colors border border-rose-500/20"
                  >
                    Resetar Banco de Dados
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ================= ABA: CALENDÁRIO ================= */}
          {currentTab === 'calendar' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Minha Agenda</h2>
                  <p className="text-xs text-slate-400">Toque em um dia para planejar</p>
                </div>
                <button onClick={handleOpenAddAgenda} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition-colors">
                  + Agendar
                </button>
              </div>

              {/* Calendário Mensal */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-bold text-slate-100 text-base">
                    {calendarMonth.toLocaleString('pt-PT', { month: 'long', year: 'numeric' }).toUpperCase()}
                  </h3>
                  <div className="flex space-x-2">
                    <button onClick={() => changeMonth(-1)} className="p-1 text-slate-400">◀</button>
                    <button onClick={() => changeMonth(1)} className="p-1 text-slate-400">▶</button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-slate-500 py-1">{day}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((dayObj, idx) => {
                    if (!dayObj) return <div key={`empty-${idx}`} className="aspect-square"></div>;
                    
                    const isSelected = dayObj.dateStr === selectedCalendarDate;
                    const isToday = dayObj.dateStr === '2026-05-26';

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedCalendarDate(dayObj.dateStr)}
                        className={`aspect-square relative flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all ${
                          isSelected 
                            ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                            : isToday
                            ? 'bg-slate-800 text-indigo-400 border border-indigo-500/40'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span>{dayObj.dayNum}</span>
                        {dayObj.hasEvents && (
                          <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                            dayObj.hasCompletedEventsOnly ? 'bg-emerald-400' : 'bg-amber-400'
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compromissos do Dia */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Compromissos para {selectedCalendarDate.split('-').reverse().join('/')}
                </h3>

                <div className="space-y-3">
                  {agendasForSelectedDay.length > 0 ? (
                    agendasForSelectedDay.map(item => (
                      <div
                        key={item.id}
                        className={`group bg-slate-900 border rounded-2xl p-4 flex items-center justify-between ${
                          item.status === 'completed' ? 'border-slate-800/40 opacity-75' : 'border-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 flex-1 min-w-0" onClick={() => handleOpenEditAgenda(item)}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAgendaStatus(item.id);
                            }}
                            className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              item.status === 'completed'
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-700 hover:border-indigo-500'
                            }`}
                          >
                            {item.status === 'completed' && <span className="text-xs">✓</span>}
                          </button>
                          <div className="truncate pr-2">
                            <h4 className={`font-bold text-sm flex items-center gap-1.5 ${item.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {item.title}
                              {item.sendEmail && <span className="text-indigo-400">✉️</span>}
                            </h4>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{item.desc || 'Sem descrição'}</p>
                            <span className="inline-block text-[10px] font-semibold text-slate-400 mt-1 bg-slate-850 px-2 py-0.5 rounded-md">
                              ⏱️ {item.time} • {item.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerEmailNotification(item);
                            }}
                            className="p-2 hover:bg-indigo-600/10 rounded-lg text-slate-400"
                          >
                            ✉️
                          </button>
                          <button onClick={() => handleOpenEditAgenda(item)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-450">
                            ✏️
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 text-xs">
                      Nenhum compromisso agendado para este dia.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= ABA: KANBAN ================= */}
          {currentTab === 'kanban' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Quadro Kanban</h2>
                  <p className="text-xs text-slate-400">Atividades de planeamento</p>
                </div>
                <button onClick={handleOpenAddKanban} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition-colors">
                  + Nova Tarefa
                </button>
              </div>

              <div className="space-y-6">
                {[
                  { id: 'todo', label: 'A Fazer', color: 'border-rose-500/50 bg-rose-500/10 text-rose-400' },
                  { id: 'progress', label: 'Em Progresso', color: 'border-amber-500/50 bg-amber-500/10 text-amber-400' },
                  { id: 'done', label: 'Concluído', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' }
                ].map(col => {
                  const tasksInCol = kanbanTasks.filter(t => t.column === col.id);

                  return (
                    <div key={col.id} className="bg-slate-900 border border-slate-850 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${col.color}`}>
                          {col.label} ({tasksInCol.length})
                        </span>
                      </div>

                      <div className="space-y-3">
                        {tasksInCol.length > 0 ? (
                          tasksInCol.map(task => (
                            <div 
                              key={task.id}
                              onClick={() => handleOpenEditKanban(task)}
                              className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 cursor-pointer hover:border-slate-700 transition-colors"
                            >
                              <div className="space-y-1">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-bold text-slate-200 text-sm">{task.title}</h4>
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase ${
                                    task.priority === 'alta' ? 'bg-rose-500/20 text-rose-400' :
                                    task.priority === 'media' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-indigo-500/20 text-indigo-400'
                                  }`}>
                                    {task.priority}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2">{task.desc}</p>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
                                <span className="text-[10px] text-slate-500 font-medium">Mover:</span>
                                <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => handleMoveKanban(task.id, -1)} disabled={col.id === 'todo'} className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-400">◀</button>
                                  <button onClick={() => handleMoveKanban(task.id, 1)} disabled={col.id === 'done'} className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-400">▶</button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-slate-500 text-xs">
                            Sem tarefas nesta etapa.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= ABA: BLOCO DE NOTAS ================= */}
          {currentTab === 'notes' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Notas Rápidas</h2>
                  <p className="text-xs text-slate-400">Guarde as suas ideias rapidamente</p>
                </div>
                <button onClick={handleOpenAddNote} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition-colors">
                  + Criar Nota
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {notes.length > 0 ? (
                  notes.map(note => (
                    <div
                      key={note.id}
                      onClick={() => handleOpenEditNote(note)}
                      className="bg-slate-900 hover:bg-slate-800/80 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between space-y-3 cursor-pointer min-h-[140px] shadow-sm relative transition-colors"
                    >
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-100 text-sm line-clamp-1">{note.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-4 whitespace-pre-line">{note.content}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-[10px] text-slate-500">
                        <span>{note.date}</span>
                        <span className="text-indigo-400">Editar →</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 text-xs">
                    Nenhuma nota registada de momento.
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 md:absolute bg-slate-950/90 backdrop-blur-md border-t border-slate-800/85 py-3 px-6 flex justify-between items-center z-20">
          <button onClick={() => setCurrentTab('dashboard')} className={`flex flex-col items-center space-y-1 ${currentTab === 'dashboard' ? 'text-indigo-500' : 'text-slate-400'}`}>
            <span className="text-base">📊</span>
            <span className="text-[10px] font-bold">Painel</span>
          </button>
          <button onClick={() => setCurrentTab('calendar')} className={`flex flex-col items-center space-y-1 ${currentTab === 'calendar' ? 'text-indigo-500' : 'text-slate-400'}`}>
            <span className="text-base">📅</span>
            <span className="text-[10px] font-bold">Agenda</span>
          </button>
          <button onClick={() => setCurrentTab('kanban')} className={`flex flex-col items-center space-y-1 ${currentTab === 'kanban' ? 'text-indigo-500' : 'text-slate-400'}`}>
            <span className="text-base">📋</span>
            <span className="text-[10px] font-bold">Tarefas</span>
          </button>
          <button onClick={() => setCurrentTab('notes')} className={`flex flex-col items-center space-y-1 ${currentTab === 'notes' ? 'text-indigo-500' : 'text-slate-400'}`}>
            <span className="text-base">📝</span>
            <span className="text-[10px] font-bold">Notas</span>
          </button>
        </nav>

        {/* ================= MODAL DINÂMICO COMPARTILHADO ================= */}
        {modalType !== null && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center p-0 md:p-4 animate-fade-in">
            <div className="bg-slate-900 w-full max-w-md rounded-t-3xl md:rounded-3xl border border-slate-800 p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-base text-white">
                  {editItem ? 'Editar Registo' : 'Novo Registo'}
                </h3>
                <button onClick={() => setModalType(null)} className="p-1 text-slate-400">✕</button>
              </div>

              {/* Formulário de Agenda */}
              {modalType === 'agenda' && (
                <form onSubmit={handleSaveAgenda} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Título do Compromisso</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Almoço de Negócios"
                      value={formData.title} 
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Descrição</label>
                    <textarea 
                      placeholder="Opcional"
                      value={formData.desc} 
                      onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Data</label>
                      <input 
                        type="date" 
                        value={formData.date} 
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Hora</label>
                      <input 
                        type="time" 
                        value={formData.time} 
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Categoria</label>
                    <select 
                      value={formData.category} 
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Trabalho">💻 Trabalho</option>
                      <option value="Saúde">🏥 Saúde</option>
                      <option value="Estudos">📚 Estudos</option>
                      <option value="Pessoal">🧘 Pessoal</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-300">Enviar e-mail de aviso</span>
                      <span className="text-[10px] text-slate-500">Para equipe.tavarez@gmail.com</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={formData.sendEmail}
                      onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                      className="w-4.5 h-4.5 text-indigo-600 border-slate-800 rounded bg-slate-950"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    {editItem && (
                      <button 
                        type="button" 
                        onClick={() => handleDeleteAgenda(editItem.id)}
                        className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold py-3 rounded-xl transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                    <button type="submit" className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl transition-colors">
                      {editItem ? 'Atualizar' : 'Agendar'}
                    </button>
                  </div>
                </form>
              )}

              {/* Formulário de Kanban */}
              {modalType === 'kanban' && (
                <form onSubmit={handleSaveKanban} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Título da Tarefa</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Ajustar componentes"
                      value={formData.title} 
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Descrição</label>
                    <textarea 
                      placeholder="Detalhes adicionais..."
                      value={formData.desc} 
                      onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Prioridade</label>
                      <select 
                        value={formData.priority} 
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="baixa">🟢 Baixa</option>
                        <option value="media">🟡 Média</option>
                        <option value="alta">🔴 Alta</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">Coluna</label>
                      <select 
                        value={formData.column} 
                        onChange={(e) => setFormData({ ...formData, column: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="todo">A Fazer</option>
                        <option value="progress">Em Progresso</option>
                        <option value="done">Concluído</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    {editItem && (
                      <button 
                        type="button" 
                        onClick={() => handleDeleteKanban(editItem.id)}
                        className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold py-3 rounded-xl transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                    <button type="submit" className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl transition-colors">
                      Guardar
                    </button>
                  </div>
                </form>
              )}

              {/* Formulário de Nota */}
              {modalType === 'note' && (
                <form onSubmit={handleSaveNote} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Título da Nota</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Lista de compras"
                      value={formData.title} 
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Conteúdo</label>
                    <textarea 
                      placeholder="Escreve aqui as tuas ideias rápidas..."
                      value={formData.desc} 
                      onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none min-h-[160px] whitespace-pre-line"
                    />
                  </div>

                  <div className="flex space-x-2 pt-4">
                    {editItem && (
                      <button 
                        type="button" 
                        onClick={() => handleDeleteNote(editItem.id)}
                        className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold py-3 rounded-xl transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                    <button type="submit" className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl transition-colors">
                      Guardar Nota
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
