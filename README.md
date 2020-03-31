# Taxiconn
Курсова робота "Розробка веб-застосування по замовленню таксі" - 3 курс

---
**Важливо:**
- [ ] */mydrives* окремо для клієнтів і водіїв з відображеннням статусів:
    - 0 - поданий (лише клієнти)
    - 1 - принятий
    - 2 - в подорожі
    - 3 - скасований
    - 4 - завершений 
- [x] */orders* (лише для водіїв) - сторінка щоб приймати замовлення 
- [x] */orders* водію відображається лише замовлення з його класу (ecomon, comfort)
- [x] */userprofile?userid=''* - сторінка клієнта
- [x] Перевірити що буде якщо додавати користувачів з однаковими id
- [x] Перевірити що буде якщо додавати orders з однаковими id
- [ ] зберігати якось фото картинки користувачів на беці
- [ ] */driverprofile?userid=''* - сторінка водія
- [ ] переробити стилі + єдина кольорова гама + зробити на всіх сторінках єдині відступи від країв (єдиний клас для всіх контейнерів)
- [ ] мобільна версія
- [x] хешування паролю
- [x] Перевірити де і як працює встановлення сірого кольору на селектори, зокрема в */becomedriver* і пофіксить баги
- [ ] реєстрація клієнтів (авторизація через гугл з надсиланням тимчасового паролю???)

**Оптимізація:**
- [ ] min.js + min.css
- [ ] меншити кількість файлів
- [ ] завантажування картинок і скриптів оптимальне
- [ ] зрендерити готові сторінки в html 
- [ ] перевірити всі картинки на формати і розміри

**Великі плани:**
- [ ] зробити сторінку знижок (*/sales*)
- [ ]  */driverprofile* - міняти електронну пошту з підтвердженням
- [ ] зміна паролю через пошту для водіїв
- [ ] на */ordertaxi* додати перевірку, щоб адреси були з одного міста
- [ ] додати користувачам мітки з найчастішими адресами і використовувати їх при замовленні таксі
- [ ] окремий сервер сторінки адміністратора (з паролем) на якій:
    - додавати методи оплати
    - додавати виробників і моделі машин
    - додовати правила користування
- [ ] підсвічувати активні вкладки в хедері
- [ ] зробити окремі сторінки і вкладеним прописати довший шлях:
    - "Блог" - */blog/...*
    - "Водію" - */driver/...*
    - "Клієнту" - */client/...*
- [ ] сторінка калькулятора цін + додати передбачення ціни на */ordertaxi*
- [ ] фільтри у водіїв в */orders* по сумі, місту, типу оплати...
- [ ] блокувати сторінку */orders* коли є незавершені поїздки
- [ ] */userprofile* виводити всіх користувачів
- [ ] додати водіям і користувачам на особисті сторінки інформацію про минулі поїздки + ставити статус "в дорозі"