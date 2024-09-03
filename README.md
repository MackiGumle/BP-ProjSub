#### Práce se bude skládat ze 3 projektů: 
- [ ] React front-end
- [ ] <strike> ASP .NET CORE (MVC) </strike> / ASP .NET CORE API
- [x] Azure SQL Database 

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
  - [ ] - Zamezit uživateli přístup na stránky pokud nemá potřebné role
  - [ ] - Správa uživatelů ???
- Back-end
  - Přihlašování
    - [x] - Zprovoznit .NET Identity 
    - [x] - API pro přidělení JSON Web Tokenu podle přihlášeného uživatele
    - [ ] - Správa uživatelů (Učitel, Student, Admin?) ???

