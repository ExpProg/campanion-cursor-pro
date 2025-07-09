export default function HomePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Главная</h1>
        <p className="text-muted-foreground">
          Добро пожаловать в Campanion Pro
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Статистика мероприятий */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Мероприятия</h3>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-primary text-sm">📅</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-sm text-muted-foreground">Всего мероприятий</p>
          </div>
        </div>

        {/* Статистика кэмпов */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Кэмпы</h3>
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
              <span className="text-secondary-foreground text-sm">🏕️</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-foreground">5</p>
            <p className="text-sm text-muted-foreground">Активных кэмпов</p>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Действия</h3>
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground text-sm">⚡</span>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left text-sm text-primary hover:underline">
              Создать мероприятие
            </button>
            <button className="w-full text-left text-sm text-primary hover:underline">
              Добавить кэмп
            </button>
            <button className="w-full text-left text-sm text-primary hover:underline">
              Просмотр отчетов
            </button>
          </div>
        </div>
      </div>

      {/* Последние обновления */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Последние обновления</h2>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-foreground">Новое мероприятие "Конференция 2024"</p>
                <p className="text-xs text-muted-foreground">2 часа назад</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-foreground">Обновлен кэмп "Летний лагерь"</p>
                <p className="text-xs text-muted-foreground">5 часов назад</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-foreground">Система обновлена до версии 2.1</p>
                <p className="text-xs text-muted-foreground">1 день назад</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 