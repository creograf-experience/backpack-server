```
npm install - установка зависимостей
npm start - запуск продакшн
npm run dev - запуск дев
npm run test:int - интегрейшн тесты
npm run test:unit - юнит тесты
npm test -- file_name - тест конкретного файла
```

Описание о том как должен выглядеть .env файл в корне проекта
находится в файле env.example

В корне проекта нужно создать папку public и в ней папку images
В корне проекта нужно создать папку uploads и в ней папку documents

# Описание API

```
доступ к файлам:
  :host_name/static/:folder/:file_name
изображения хранятся в папке images, пример:
  :host_name/static/images/1421-1234-41.png

ответ имеет следующий вид:
  200 {
    success: true,
    metadata: {},
    data: {}
  }

при ошибке приходит ответ вида:
  400...500 {
    success: false,
    error: 'Сообщение об ошибке'
  }

если запрос Public то он доступен для всех
если запрос Private то нужно добавить в headers
поле Authorization со значением Bearer :token,
:token мы получаем после авторизации, время жизни токена 7 дней.
Рядом указывается роль кому доступен запрос, например:
  Private admin
  Private user
  Private admin, user

Admin
  Авторизация админа
  Public
  Content-type: applicatin/json
  POST /admin/login
    body {
      login: 'admin-login',
      password: 'admin-password'
    }

    200 {
      success: true,
      data: {
        token: '5asd6f5as7d6...'
      }
    }

Reset Password
  Запрос на восстановление пароля
  Public
  Content-type: application/json
  POST /reset-password
   body {
     email: 'test@email.com'
   }
   200 {
     success: true
   }

Client
  Получить список клиентов
  Private admin
  все параметры можно комбинировать по правилам построения query url: ?param1=value1&param2=value2
  GET /clients - все клиенты, можно отправить ?page=0 ответ будет такой же
  GET /clients?page=1 - клиенты с пагинацией
  GET /clients?search=text - поиск по названию, email, юр. лицу, телефону.
  GET /clients?sort=field - сортировка по полю, поле должно соответствовать названию в табличке БД.
                          field по возрастанию -field по убыванию, например sort=contactName sort=-legalEntity sort=campaigns.amount                        
    200 {
      success: true,
      metadata: {
        totalCount: 50,
        totalPages: 3,
        page: 1
      },
      data: {
        clients: [
          {
            agency: {
              logo: '7ec1d63a-516e-4ae8-93ce-60633a8649e6.png',
              name: 'test-agency-name'
            },
            password: '',
            legalEntity: 'test-legal-entity',
            logo: '23c9ef75-9cab-49e1-bdcc-9b947ea771e1.png',
            description: 'test-descr',
            INN: 'test-INN',
            contactName: 'test-contact-name',
            phone: 'test-phone',
            campaigns: {
              amount: 0,
              activeAmount: 0
            },
            _id: 5ea86dcd2740131f232df215,
            name: 'test-name',
            email: 'correct@email.com',
            isBlocked: false,
            isDeleted: false
          },
          { ... }
        ]
      }
    }

  Получение данных у клиента
  Private client
  GET /clients/client  
    200 {
        success: true,
        data: {
          clients: {
            agency: {
              logo: '7ec1d63a-516e-4ae8-93ce-60633a8649e6.png',
              name: 'test-agency-name'
            },
            password: '',
            legalEntity: 'test-legal-entity',
            logo: '23c9ef75-9cab-49e1-bdcc-9b947ea771e1.png',
            description: 'test-descr',
            INN: 'test-INN',
            contactName: 'test-contact-name',
            phone: 'test-phone',
            campaigns: {
              amount: 0,
              activeAmount: 0
            },
            _id: 5ea86dcd2740131f232df215,
            name: 'test-name',
            email: 'correct@email.com',
            isBlocked: false,
            isDeleted: false
          }
        }

  Создание клиента
  Private admin
  Content-type: multipart/form-data
  POST /clients
    Поля формы
      name: 'название', обязательное поле
      email: 'email', обязательное поле
      legalEntity: 'юредическое лицо',
      logo: 'лого', файл png jpg jpeg
      agencyLogo: 'лого агенства', файл png jpg jpeg
      agencyName: 'название агенства',
      description: 'описание',
      INN: 'ИНН',
      contactName: 'контактное лицо',
      phone: 'телефон'

    200 {
      success: true,
      data: {
        client: { объект созданного клиента }
      }
    }

  Обновить клиента
  Private admin
  Content-type: multipart/form-data
  PUT /clients/:client_id
    Поля формы
      name: 'название', обязательное поле
      email: 'email', обязательное поле
      legalEntity: 'юредическое лицо',
      logo: 'лого', файл png jpg jpeg
      agencyLogo: 'лого агенства', файл png jpg jpeg
      agencyName: 'название агенства',
      description: 'описание',
      INN: 'ИНН',
      contactName: 'контактное лицо',
      phone: 'телефон'

    200 {
      success: true,
      data: {
        client: { объект обновленного клиента }
      }
    }

  Отправить доступ клиенту
  Private admin
  PUT /clients/send-access/:client_id
    200 { success: true }

  Заблокировать клиента
  Private admin
  PUT /clients/block/:client_id
    200 { success: true }

  Удалить клиента
  Private admin
  DELETE /clients/:client_id
    200 { success: true }

Campaign
  Получить список кампаний
  Private admin
  все параметры можно комбинировать по правилам построения query url: ?param1=value1&param2=value2
  GET /campaigns - все кампании, можно отправить ?page=0 ответ будет такой же
  GET /campaigns?page=1 - кампании с пагинацией
  GET /campaigns?search=text - поиск по названию клиента, email клиента, номеру кампании
  GET /campaigns?sort=field - сортировка по полю, поле должно соответствовать названию в табличке БД.
                              field по возрастанию -field по убыванию
    200 {
      success: true,
      metadata: {
        totalCount: 50,
        totalPages: 3,
        page: 1
      },
      data: {
        campaigns: [
          {
            _id: '5eb54aac8d2d410ab6bd6aa4',
            client: { ...объект клиента... },
            number: 346169,
            name: 'test-name',
            date: { from: '2020-05-01', to: '2020-05-08' },
            status: 'active',
            photoReportUrl: '',
            documentCount: 0,
            dayPart: { morning: true, evening: true },
            MAC: { isVisible: false, data: '' },
            GRP: { isVisible: false, data: '' },
            Frequency: { isVisible: false, data: '' },
            OTS: { isVisible: false, data: '' }
          },
          { ... }
        ]
      }
    }
    
  Получить компании клиента
  Private client
  GET /campaigns/client
    200 {
      success: true,
      data: {
        campaigns: [
          {
            _id: '5eb54aac8d2d410ab6bd6aa4',
            client: { ...объект клиента... },
            number: 346169,
            name: 'test-name',
            date: { from: '2020-05-01', to: '2020-05-08' },
            status: 'active',
            photoReportUrl: '',
            documentCount: 0,
            dayPart: { morning: true, evening: true },
            MAC: { isVisible: false, data: '' },
            GRP: { isVisible: false, data: '' },
            Frequency: { isVisible: false, data: '' },
            OTS: { isVisible: false, data: '' }
          },
          { ... }
        ]
      }
    }

  Создать кампании
  Private admin
  Content-type: application/json
  POST /campaigns
    body {
      name: 'Название', // обязательное поле
      client: 'asd6f9a6s...' // id клиента обязательное поле
      date: { from: '2020-12-20', to: '2020-12-25' }, // обязательное поле, формат yyyy-mm-dd
      dayPart: { morning: true, evening: true },
      status: 'active' или 'archived',
      photoReportUrl: 'Ссылка на фотоотчет',
      MAC: { isVisible: false },
      GRP: { isVisible: false },
      Frequency: { isVisible: false },
      OTS: { isVisible: false }
    }

    200 {
      success: true,
      data: {
        campaign: { ...объект кампании... }
      }
    }

  Обновить кампанию
  Private admin
  Content-type: application/json
  PUT /campaigns/:campaign_id
    body { ...как при создании... }
    200 {
      success: true,
      data: {
        campaign: { ...объект обновленной кампании... }
      }
    }

  Удалить кампанию
  Private admin
  DELETE /campaigns/:campaign_id
    200 { success: true }

Documents
  Получить список документов кампании
  Private admin
  GET /documents/:campaign_id
    200 {
      success: true,
      data: {
        documents: [
          {
            _id: '5eb6da7ec7fe9211e167d4f8',
            campaign: '5eb6da7ec7fe9211e167d4f7',
            friendlyName: 'test-document.pdf',
            ext: 'pdf'
          },
          { ... }
        ]
      }
    }
  Получить список документов кампании у клиента
  Private client
  GET /documents/client/:campaign_id
    200 {
      success: true,
      data: {
        documents: [
          {
            _id: '5eb6da7ec7fe9211e167d4f8',
            campaign: '5eb6da7ec7fe9211e167d4f7',
            friendlyName: 'test-document.pdf',
            ext: 'pdf'
          },
          { ... }
        ]
      }
    }
  Загрузить документ
  Private admin
  Content-type: multipart/from-data
  POST /documents
    Тело формы
      campaign: 'id кампании', // обязательное поле
      documents: 'файлы до 5 штук pdf doc xls' // обязательное поле

    200 {
      success: true,
      data: {
        document: { ...объект документа... }
      }
    }

  Удалить документ
  Private admin
  Content-type: application/json
  DELETE /documents/:campaign_id
    body {
      documentIds: ['id документа', 'id документа'] // обязательное поле
    }

    200 { success: true }

Backpack
  Получить список рюкзаков
  Private admin
  GET /backpacks - все рюкзаки, можно отправить ?page=0 ответ будет такой же
  GET /backpacks?page=1 - рюкзаки с пагинацией
    200 {
       "success": true,
    "metadata": {
        "totalPages": 1
    },
    "data": {
        "backpacks": [
            {
                office: "Офис 1",
                status: true,
                _id: "5ebe63798b050a27dc52593f",
                number: 1,
                description: "test",
                idBackpack: "50:46:5D:6E:8C:20",
            },
            {
                office: "Офис 1",
                status: true,
                _id: "5ec23a514b03604b702ce81a",
                number: 2,
                description: "test",
                idBackpack: "50:46:5D:6E:8C:20"
            }
        ]
    }

  Создать рюкзак
  Private admin
  Content-type: application/json
  POST /backpacks
    body {
      number:3,//обязательное поле
      description:"test",//обязательное поле
      office:"Офис 1",
      idBackpack:"50:46:5D:6E:8C:20",//обязательное поле
      status:true,//обязательное поле
    }

    200 {
      success: true,
      data: {
        backpack: { ...объект рюкзака... }
      }
    }
  
  Обновить рюкзак
  Private admin
  Content-type: application/json
  PUT /backpacks/:backpackId
    body { ...как при создании... }
    200 {
      success: true,
      data: {
        backpack: { ...объект обновленного рюкзака... }
      }
    }

  Удалить рюкзак
  Private admin
  DELETE /backpacks/:backpackId
    200 { success: true }

Координаты рюкзаков
  Получить рюкзаки с отправленными коориданатами за сегодня
  Private admin
  GET /geobackpacks
    200 {
      success: true,
      data: {
        geoBackpacks: [
          {
            _id: "5ec37cfc6bd2ad2780881f7c",
            geoMorning: [ // массив координат для рюкзака на утро
                {
                  longitude: 55.17866129762234,
                  latitude: 61.33279624763261
                }
            ],
            backpack: "50:46:5D:6E:8C:2011232",//ид рюкзака
            geoEvening: [] // массив кординат для рюкзака на вечер
          },
          { ... }
        ]
    }
  Отправить координаты рюкзака 
  Private admin
  Content-type: application/json
  POST /geobackpacks/:backpackId //ид рюкзака
    body {
      longitude:55.178661297622341, //значение долготы
      latitude:61.33279624763261  //значение широты
    }

Маршруты 
  Загрузить маршрут
    Private admin
    Content-type: multipart/from-data
    POST /map-routes
      Тело формы
        file: 'файл kml' // обязательное поле

      200 {
        success: true,
        data: {
          mapRoute: { ...объект распаршенного маршрута... }
        }
      }
  Получить маршруты
    Private client
    GET /map-routes?backpack=[массив из ObjectId рюкзаков]
      200 {
          success: true,
          data: {
            mapRoute: [
              {
                route:[
                  {
                    lat: 55.73664,
                    lng: 37.61414
                  },
                  {...}//массив из координат
                ],
                _id: "5ecd0cba45ff4c2b54c2d403",
                friendlyName: "7016_tue_1.kml",
                backpackIdFile: "7016",
                ext: "kml",
                dayWeek: "tue",
                dayPart: "1",
                backpack: {..}//объект рюкзака для которого загрузили маршрут
              },
              {...}
            ]
          }
        }
```    