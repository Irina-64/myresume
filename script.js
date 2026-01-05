// Анимация появления элементов при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, что все элементы загружены
    const heroElements = document.querySelectorAll('.hero-content > *');

    // Добавляем класс для плавного появления
    heroElements.forEach((element) => {
        element.style.willChange = 'opacity, transform';
    });

    // Плавная прокрутка для кнопки CTA
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }

    // Создание интерактивных звездочек
    initInteractiveStars();

    // Инициализация интерактивного блока "Мои навыки"
    initSkillsSection();
});

// Работа с интерактивным блоком "Мои навыки"
const SKILLS_STORAGE_KEY = 'myJournal.skills';

function initSkillsSection() {
    const skillsGrid = document.getElementById('skills-grid');
    const addSkillButton = document.getElementById('add-skill-button');

    if (!skillsGrid || !addSkillButton) {
        return;
    }

    const initialSkills = [
        {
            title: 'Frontend-разработка',
            description: 'HTML, CSS, современный JavaScript, создание адаптивных интерфейсов без перегруженности.',
            done: false
        },
        {
            title: 'Преподавание и менторство',
            description: 'Объясняю сложные вещи простым языком, сопровождаю студентов в их первых проектах.',
            done: false
        },
        {
            title: 'Интеграция AI в обучение',
            description: 'Экспериментирую с использованием нейросетей для автоматизации и персонализации обучения.',
            done: false
        }
    ];

    let skills = loadSkills() || initialSkills;

    renderSkills(skillsGrid, skills);

    addSkillButton.addEventListener('click', function () {
        const newSkill = promptNewSkill();
        if (!newSkill) {
            return;
        }

        skills = [...skills, newSkill];
        saveSkills(skills);
        renderSkills(skillsGrid, skills);
    });
}

function promptNewSkill() {
    const title = window.prompt('Введите название навыка:');
    if (!title || !title.trim()) {
        return null;
    }

    const description = window.prompt('Введите короткое описание навыка:');

    return {
        title: title.trim(),
        description: description && description.trim()
            ? description.trim()
            : 'Описание будет добавлено позже.'
    };
}

function renderSkills(container, skills) {
    container.innerHTML = '';

    skills.forEach((skill, index) => {
        const card = document.createElement('article');
        card.className = 'skill-card';
        const isDone = Boolean(skill.done);
        if (isDone) {
            card.classList.add('skill-card--done');
        }
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-expanded', 'false');
        card.dataset.index = String(index);

        const header = document.createElement('div');
        header.className = 'skill-card__header';

        const titleEl = document.createElement('h3');
        titleEl.className = 'skill-card__title';
        titleEl.textContent = skill.title;

        if (isDone) {
            titleEl.classList.add('skill-card__title--done');
        }

        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'skill-card__actions';

        const toggleDoneButton = document.createElement('button');
        toggleDoneButton.type = 'button';
        toggleDoneButton.className = 'skill-card__action skill-card__toggle-done';
        toggleDoneButton.setAttribute(
            'aria-label',
            `${isDone ? 'Снять отметку о выполнении навыка' : 'Отметить навык как выполненный'} "${skill.title}"`
        );
        toggleDoneButton.textContent = isDone ? '✓' : '○';

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'skill-card__action skill-card__delete';
        deleteButton.setAttribute('aria-label', `Удалить навык "${skill.title}"`);
        deleteButton.textContent = '×';

        actionsWrapper.appendChild(toggleDoneButton);
        actionsWrapper.appendChild(deleteButton);

        header.appendChild(titleEl);
        header.appendChild(actionsWrapper);

        const descEl = document.createElement('p');
        descEl.className = 'skill-card__description';
        descEl.textContent = skill.description;

        card.appendChild(header);
        card.appendChild(descEl);

        const toggle = () => {
            const isExpanded = card.classList.toggle('skill-card--expanded');
            card.setAttribute('aria-expanded', String(isExpanded));
        };

        card.addEventListener('click', toggle);
        card.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggle();
            }
        });

        toggleDoneButton.addEventListener('click', (event) => {
            event.stopPropagation();

            const updatedSkills = skills.map((item, skillIndex) =>
                skillIndex === index
                    ? {
                          ...item,
                          done: !isDone
                      }
                    : item
            );

            saveSkills(updatedSkills);
            renderSkills(container, updatedSkills);
        });

        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();

            const confirmed = window.confirm(`Удалить навык "${skill.title}"?`);
            if (!confirmed) {
                return;
            }

            const updatedSkills = skills.filter((_, skillIndex) => skillIndex !== index);
            saveSkills(updatedSkills);
            renderSkills(container, updatedSkills);
        });

        container.appendChild(card);
    });
}

function saveSkills(skills) {
    try {
        const data = JSON.stringify(skills);
        window.localStorage.setItem(SKILLS_STORAGE_KEY, data);
    } catch (error) {
        // Тихо игнорируем ошибки работы с localStorage, чтобы не ломать UI
        console.error('Не удалось сохранить навыки в localStorage', error);
    }
}

function loadSkills() {
    try {
        const raw = window.localStorage.getItem(SKILLS_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return null;
        }

        return parsed
            .filter(
                (item) => item && typeof item.title === 'string' && typeof item.description === 'string'
            )
            .map((item) => ({
                ...item,
                done: Boolean(item.done)
            }));
    } catch (error) {
        console.error('Не удалось прочитать навыки из localStorage', error);
        return null;
    }
}

// Функция для создания и управления звездочками
function initInteractiveStars() {
    const starsContainer = document.getElementById('starsContainer');
    if (!starsContainer) return;

    const stars = [];
    const starCount = 50; // Количество звездочек
    const mouseRadius = 150; // Радиус влияния курсора
    let mouseX = 0;
    let mouseY = 0;

    // Создание звездочек
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Случайная позиция
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        star.style.left = x + '%';
        star.style.top = y + '%';
        
        // Случайная задержка анимации для разнообразия
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        starsContainer.appendChild(star);
        
        // Сохраняем данные звездочки
        stars.push({
            element: star,
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            vx: 0, // скорость по X
            vy: 0  // скорость по Y
        });
    }

    // Отслеживание движения курсора
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        updateStars();
    });

    // Обновление позиций и яркости звездочек
    function updateStars() {
        const heroRect = document.querySelector('.hero').getBoundingClientRect();
        const mouseXRelative = mouseX - heroRect.left;
        const mouseYRelative = mouseY - heroRect.top;
        
        stars.forEach(star => {
            const starRect = star.element.getBoundingClientRect();
            const starX = starRect.left + starRect.width / 2 - heroRect.left;
            const starY = starRect.top + starRect.height / 2 - heroRect.top;
            
            // Расстояние от курсора до звездочки
            const dx = mouseXRelative - starX;
            const dy = mouseYRelative - starY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Если курсор близко к звездочке
            if (distance < mouseRadius) {
                // Вычисляем направление "убегания" от курсора
                const angle = Math.atan2(dy, dx);
                const force = (mouseRadius - distance) / mouseRadius; // сила отталкивания (0-1)
                const maxSpeed = 2; // максимальная скорость убегания
                
                // Увеличиваем скорость убегания
                star.vx += Math.cos(angle + Math.PI) * force * maxSpeed * 0.1;
                star.vy += Math.sin(angle + Math.PI) * force * maxSpeed * 0.1;
                
                // Увеличиваем яркость
                star.element.classList.add('bright');
                
                // Изменяем яркость в зависимости от расстояния
                const brightness = 1 - (distance / mouseRadius) * 0.5;
                star.element.style.opacity = Math.max(0.5, brightness);
            } else {
                // Возвращаем звездочку к исходной позиции
                star.vx *= 0.9; // замедление
                star.vy *= 0.9;
                
                // Убираем яркость
                star.element.classList.remove('bright');
            }
            
            // Применяем движение
            star.x += star.vx;
            star.y += star.vy;
            
            // Возвращаем к исходной позиции с плавностью
            const returnForce = 0.05;
            star.x += (star.baseX - star.x) * returnForce;
            star.y += (star.baseY - star.y) * returnForce;
            
            // Ограничиваем границами
            star.x = Math.max(0, Math.min(100, star.x));
            star.y = Math.max(0, Math.min(100, star.y));
            
            // Обновляем позицию
            star.element.style.left = star.x + '%';
            star.element.style.top = star.y + '%';
        });
    }

    // Плавное обновление анимации
    function animate() {
        updateStars();
        requestAnimationFrame(animate);
    }
    
    animate();
}

(function () {
    const sliders = [
      { id: "skill-html", valueId: "skill-html-value" },
      { id: "skill-css", valueId: "skill-css-value" },
      { id: "skill-js", valueId: "skill-js-value" },
      { id: "skill-react-vue", valueId: "skill-react-vue-value" },
      { id: "skill-llm", valueId: "skill-llm-value" },
    ];

    const averageValueEl = document.getElementById("skill-average-value");
    const descriptionEl = document.getElementById("skill-description");
    const gaugeFillEl = document.getElementById("skill-gauge-fill");

    const STORAGE_KEY = "skillIndexValues";

    function getDescriptionByPercent(percent) {
      if (percent >= 0 && percent <= 25) {
        return "Начинающий, верный старт";
      }
      if (percent >= 26 && percent <= 50) {
        return "Прогрессируешь, держи темп";
      }
      if (percent >= 51 && percent <= 75) {
        return "Уверенно растёшь, почти junior";
      }
      return "Сильная база — готов к портфолио";
    }

    function loadFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        console.warn("Не удалось прочитать skillIndexValues из localStorage", e);
        return null;
      }
    }

    function saveToStorage(values) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      } catch (e) {
        console.warn("Не удалось сохранить skillIndexValues в localStorage", e);
      }
    }

    function updateUI() {
      const values = sliders.map(({ id }) => {
        const input = document.getElementById(id);
        return Number(input.value || 0);
      });

      // Обновление чисел под ползунками
      sliders.forEach(({ id, valueId }) => {
        const input = document.getElementById(id);
        const valueEl = document.getElementById(valueId);
        if (input && valueEl) {
          valueEl.textContent = input.value;
        }
      });

      // Среднее значение
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = values.length ? Math.round(sum / values.length) : 0;

      if (averageValueEl) {
        averageValueEl.textContent = avg;
      }

      if (gaugeFillEl) {
        gaugeFillEl.style.width = avg + "%";
      }

      if (descriptionEl) {
        descriptionEl.textContent = getDescriptionByPercent(avg);
      }

      // Сохранение в localStorage
      saveToStorage(values);
    }

    function init() {
      const saved = loadFromStorage();

      sliders.forEach((item, index) => {
        const input = document.getElementById(item.id);
        const valueEl = document.getElementById(item.valueId);

        if (!input || !valueEl) return;

        const initialValue =
          saved && Array.isArray(saved) && typeof saved[index] === "number"
            ? saved[index]
            : 0;

        input.value = initialValue;
        valueEl.textContent = initialValue;

        input.addEventListener("input", updateUI);
      });

      updateUI();
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();