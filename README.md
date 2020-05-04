# Taxiconn
Курсова робота "Розробка веб-застосування по замовленню таксі" - 3 курс

---
**Не працює:**

**Важливо:**
- [x] сторінка калькулятора цін + додати передбачення ціни на */ordertaxi*
- [x] додати обмеження на замовлення машин клієнтами: 2
- [x] рахувати час поїздки
- [x] */orders/my* окремо для клієнтів і водіїв з відображеннням статусів:
    - 0 - поданий (лише клієнти)
    - 1 - в подорожі
    - 2 - скасований водієм
    - 3 - скасований клієнтом
    - 4 - завершений 
- [x] */orders* (лише для водіїв) - сторінка щоб приймати замовлення 
- [x] */orders* водію відображається лише замовлення з його класу (ecomon, comfort)
- [x] */userprofile?userid=''* - сторінка клієнта
- [x] Перевірити що буде якщо додавати користувачів з однаковими id
- [x] Перевірити що буде якщо додавати orders з однаковими id
- [x] зберігати якось фото картинки користувачів на беці
- [x] */driverprofile?userid=''* - сторінка водія
- [x] переробити стилі + єдина кольорова гама 
- [x] хешування паролю
- [x] мобільна версія
- [x] Перевірити де і як працює встановлення сірого кольору на селектори, зокрема в */becomedriver* і пофіксить баги
- [x] реєстрація клієнтів (з надсиланням тимчасового паролю???)
- [x] рахувати кількості поїздок, скасованих та завершених для клієнта і водія і показувати в блозі

**Великі плани:**
- [ ] рахувати зарплату водіям
- [ ] запланувати поїздку на якийсь час
- [ ] оцінювання якості поїздки
- [ ] на сторінці workcond зробити фільтр по виробнику
- [ ]  */driverprofile* - міняти електронну пошту з підтвердженням
- [ ] додати користувачам мітки з найчастішими адресами і використовувати їх при замовленні таксі
- [ ] окремий сервер сторінки адміністратора (з паролем) на якій:
    - додавати методи оплати
    - додавати виробників і моделі машин
    - додовати правила користування
    - */userprofile* виводити всіх користувачів
- [ ] зробити окремі сторінки і вкладеним прописати довший шлях:
    - "Блог" - */blog/...*
    - "Водію" - */driver/...*
    - "Клієнту" - */client/...*
- [ ] фільтри у водіїв в */orders* по сумі, місту, типу оплати...
- [ ] додати водіям і користувачам на особисті сторінки інформацію про минулі поїздки + ставити статус "в дорозі"
- [ ] зробити додатковий захист на сторінку confirm register, щоб на неї не можна було просто так перейти



* архітектура серверу
https://www.digitalocean.com/community/questions/post-request-redirects-to-get-in-nginx-proxy-and-nodejs