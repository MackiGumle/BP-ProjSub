#### Práce se bude skládat ze 3 projektů: 
- [ ] React front-end
- [ ] <strike> ASP .NET CORE (MVC) </strike> / ASP .NET CORE API
- [x] Azure SQL Database 
- [ ] Hosting na Azure app service
---

#### TODO:
- DB 
  - [x] - Azure SQL DB ( https://learn.microsoft.com/en-us/azure/azure-sql/database/free-offer?view=azuresql )
  - [x] - Vytvořit tabulky (sql skript)
  - [x] - Zakomponovat IdentityUser do tabulky Person. -> Entity Framework Scaffolding ( https://learn.microsoft.com/en-us/ef/core/managing-schemas/scaffolding/?tabs=dotnet-core-cli )
- Front-end
  - [x] - Nainstalovat Shadcn-ui do Vite ( https://ui.shadcn.com/docs/installation/vite )
  - [x] - Routing pomocí React Router ( https://reactrouter.com/en/main/start/tutorial )
  - [x] - Login/Register Formuláře
  - [x] - Zamezit uživateli přístup na stránky pokud nemá potřebné role
  - [x] - UI pro uživatele s aktivovaným účtem bez hesla (set password?)
  - [ ] - Request na nový token ~10min před expirací
  - [x] - Formulář pro učitele pro přidávání předmětů 
  - [ ] - UI pro učitele na přidávání studentů (rovnou do předmětu?) 
  - [ ] - UI pro studenty k zobrazování předmětů, zadání a odevzdání 
- Back-end
  - Přihlašování
    - [x] - Zprovoznit .NET Identity 
    - [x] - API pro přidělení JSON Web Tokenu podle přihlášeného uživatele
    - [ ] - API pro získání nového tokenu (refresh platnosti)
    - [ ] - Správa předmětů a zadání: CRUD operace
    - [ ] - Správa studentů pro učitele: přidávání studentů do předmětu

#### Required env. variables:
- ApiKeys__SendGrid
- ConnectionStrings__BakalarkaDB
