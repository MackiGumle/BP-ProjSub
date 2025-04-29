#### Prerekvizity
- Visual Studio 2022 verze 17.11 nebo novější s nainstalovanou úlohou **ASP.NET a vývojem webu**.
- npm ([`https://www.npmjs.com/`](https://www.npmjs.com/package/npm)), který je součástí Node.js
---
#### Vytvoření služeb
1.  Azure SQL Database -  [Vytvoření DB](https://learn.microsoft.com/cs-cz/azure/azure-sql/database/single-database-create-quickstart?view=azuresql&tabs=azure-portal) (u kroku 14 je nutné **Povolit službám a prostředkům Azure přístup k tomuto serveru** na hodnotu **Ano**)
2. Azure Blob Storage - [Vytvoření uložiště](https://learn.microsoft.com/cs-cz/azure/storage/common/storage-account-create?tabs=azure-portal)
3. Azure App Service - [Vytvoření serveru](https://portal.azure.com/#create/Microsoft.WebSite) (nastavte **Continuous deployment** = Enable) poté podle [videa](https://youtu.be/7LkRipTlTzc?si=JvPaiV-Zn0qQRGyr&t=248) pokračujte k nasazení a v záložce **Deployment type** vyberte **CI/CD Using GitHub Actions ...** a tím video končí.
4. SendGrid - https://sendgrid.com/ získejte API klíč pro posílání e-mailů 

Po těchto krocích je nutné nastavit následující proměnné prostředí v Azure App Service:
- ApiKeys__SendGrid
	- získané z kroku 4
- WebsiteUrl (URL nasazené aplikace)
- ConnectionStrings__BakalarkaBlob
	- Access key k Azure Blob Storage (najdete v záložce Security+networking)
- ConnectionStrings__BakalarkaDB
	- Connection string k Azure SQL DB (najdete v záložce settings -> ADO.NET (SQL authentication), je nutné přepsat heslo v textu)
#### Vytvoření tabulek v DB
1. Přejděte v terminálu do adresáře  BP-ProjSub.Server/
2. proveďte příkaz: `dotnet ef database update`
3. v DB by nyní měly být vytvořené tabulky (heslo pro admin uživatele je: P@ssw0rd)

Po nastavení proměnných spusťte proces nasazení pomocí GitHub actions. 
