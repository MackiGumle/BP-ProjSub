![](https://github.com/MackiGumle/BP-ProjSub/blob/main/Pictures/Student_assignments.png)
![](https://github.com/MackiGumle/BP-ProjSub/blob/main/Pictures/Student_assignment.png)
![](https://github.com/MackiGumle/BP-ProjSub/blob/main/Pictures/Student_assignment_wimage.png)

![](https://github.com/MackiGumle/BP-ProjSub/blob/main/Pictures/Teacher_assignments_grid.png)
![](https://github.com/MackiGumle/BP-ProjSub/blob/main/Pictures/Teacher_Zadani.png)
![](https://github.com/MackiGumle/BP-ProjSub/blob/main/Pictures/Teacher_Zadani_Edit.png)
![](https://github.com/MackiGumle/BP-ProjSub/blob/main/Pictures/File_View.png)
![](https://github.com/MackiGumle/BP-ProjSub/blob/main/Pictures/accounts.png)


## Administrátor

Administrátor představuje nejvyšší úroveň oprávnění v systému a zodpovídá za celkovou správu uživatelů:

- **Vytváření uživatelských účtů** - Administrátor má výhradní oprávnění vytvářet účty s rolí učitele nebo dalšího administrátora.
- **Správa stavu účtů** - Administrátor disponuje pravomocí zablokovat nebo odblokovat jakýkoliv uživatelský účet v systému.
- **Výchozí administrátorský účet** - Pro zajištění správy systému od počátku nasazení musí databáze obsahovat jeden předdefinovaný administrátorský účet.

## Učitel

Učitel zodpovídá za správu předmětů, studentů a zadání s následujícími požadavky:

- **Správa předmětů** - Učitel může vytvářet nové předměty a spravovat jejich obsah.
- **Správa studentů v předmětech** - Učitel má možnost pomocí studentských identifikátorů přidávat a odebírat studenty z předmětů, které vyučuje.
- **Vytváření studentských účtů** - Systém umožňuje učiteli vytvářet studentské účty prostřednictvím procesu přidání do předmětu.
- **Správa zadání:**
  - Vytvářet nová zadání s formátováním textu pomocí *Markdown*
  - Přikládat a odebírat soubory jako přílohy k zadání
  - Editovat popis, termín odevzdání a bodové hodnocení existujících zadání
  - Mazat zadání, která již nejsou relevantní
- **Kontrola plagiátorství** - Systém umožňuje učiteli provést kontrolu plagiátorství u odevzdaných souborů.
- **Komentování kódu** - Učitel má možnost vkládat komentáře do odevzdaného zdrojového kódu.
- **Hodnocení odevzdání** - Učitel má možnost bodově ohodnotit odevzdané úkoly.
- **Exportní funkce:**
  - Exportovat odevzdané soubory do formátu *zip*
  - Exportovat hodnocení studentů do formátu *csv*

## Student

Požadavky na funkcionalitu pro studenty v systému zahrnují:

- **Zobrazení předmětů** - Student si může zobrazit pouze předměty, ve kterých je zapsán.
- **Zobrazení zadání** - Zadání jsou studentovi prezentována s formátováním dle syntaxe *Markdown* včetně možnosti stažení příloh poskytnutých učitelem.
- **Odevzdání úkolu** - Systém umožňuje odevzdávání souborů metodou přetažení a puštění.

## Správa odevzdaných souborů

Systém poskytuje specifické funkce pro práci s odevzdanými soubory s odlišnými oprávněními podle role uživatele:

- **Zobrazení souborů** - Systém umožňuje prohlížení odevzdaných souborů:
  - Učitelé mají přístup ke všem odevzdaným souborům v rámci předmětů, které vyučují.
  - Studenti mohou zobrazit pouze své vlastní odevzdané soubory.
- **Formátování kódu** - Zdrojové kódy v podporovaných programovacích jazycích jsou zobrazeny s barevným zvýrazněním syntaxe.
- **Zpracování nepodporovaných formátů** - Soubory v nepodporovaných formátech lze stáhnout pro lokální zobrazení.
- **Správa archivů** - Odevzdané soubory ve formátu *zip* jsou automaticky rozbaleny pro přímý přístup k obsaženým souborům.
- **Sledování aktivity** - Systém monitoruje přístup

---

#### Prerekvizity
- Visual Studio 2022 verze 17.11 nebo novější s nainstalovanou úlohou **ASP.NET a vývojem webu**.
- npm ([`https://www.npmjs.com/`](https://www.npmjs.com/package/npm)), který je součástí Node.js

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
