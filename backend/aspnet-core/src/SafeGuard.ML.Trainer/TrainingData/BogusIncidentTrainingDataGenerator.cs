using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace SafeGuard.ML.Trainer.TrainingData;

public class BogusIncidentTrainingDataGenerator
{
    private static readonly Random Rng = new();

    private record CrimeStats(
        string Category, int Q3Count, double ShareOfTotal,
        double CaseOpenRate, double DetectionRate, bool IsViolent);

    private static readonly CrimeStats[] Stats =
    [
        new("murder",                    6_351, 0.0165, 0.95, 0.72, true),
        new("sexual_offence",           14_547, 0.0377, 0.90, 0.24, true),
        new("attempted_murder",          7_858, 0.0204, 0.92, 0.54, true),
        new("assault_gbh",              50_253, 0.1302, 0.80, 0.38, true),
        new("common_assault",           53_539, 0.1387, 0.65, 0.30, false),
        new("common_robbery",           11_574, 0.0300, 0.75, 0.28, true),
        new("robbery_aggravating",      31_088, 0.0806, 0.82, 0.26, true),
        new("carjacking",                4_420, 0.0115, 0.88, 0.22, true),
        new("robbery_residential",       5_450, 0.0141, 0.80, 0.24, true),
        new("robbery_non_residential",   2_942, 0.0076, 0.78, 0.20, true),
        new("arson",                       737, 0.0019, 0.70, 0.30, false),
        new("malicious_damage",         28_690, 0.0743, 0.50, 0.18, false),
        new("burglary_non_residential", 10_918, 0.0283, 0.60, 0.18, false),
        new("burglary_residential",     32_833, 0.0851, 0.55, 0.15, false),
        new("motor_vehicle_theft",       7_477, 0.0194, 0.70, 0.20, false),
        new("theft_from_vehicle",       18_068, 0.0468, 0.40, 0.14, false),
        new("stock_theft",               6_295, 0.0163, 0.60, 0.22, false),
        new("theft_general",            59_149, 0.1533, 0.35, 0.12, false),
        new("commercial_crime",         37_174, 0.0963, 0.55, 0.35, false),
        new("drug_related",             57_808, 0.1498, 0.85, 0.68, false),
        new("illegal_firearms",          4_103, 0.0106, 0.90, 0.75, false),
        new("kidnapping",                4_775, 0.0124, 0.88, 0.42, true),
        new("cash_in_transit",              37, 0.0001, 0.98, 0.18, true),
    ];

    private static CrimeStats SampleCrimeByWeight()
    {
        var r = Rng.NextDouble();
        var cumulative = 0.0;
        foreach (var s in Stats)
        {
            cumulative += s.ShareOfTotal;
            if (r <= cumulative) return s;
        }
        return Stats[^1];
    }

    private record Location(string Name, string[] Streets, double Lat, double Lng, double Radius);

    private static readonly Location[] Locations =
    [
        new("Sandton, Johannesburg",       ["Rivonia Road","Sandton Drive","West Street","Katherine Street"],       -26.1076, 28.0567, 0.03),
        new("Soweto, Johannesburg",        ["Vilakazi Street","Mooki Street","Klipspruit Valley Road"],             -26.2672, 27.8583, 0.05),
        new("Johannesburg CBD",            ["Commissioner Street","Noord Street","Eloff Street","Bree Street"],     -26.2041, 28.0473, 0.03),
        new("Alexandra, Johannesburg",     ["Selborne Road","London Road","Wynberg Avenue"],                       -26.1002, 28.1023, 0.03),
        new("Roodepoort, Johannesburg",    ["Hendrik Potgieter Road","Ontdekkers Road","Main Reef Road"],           -26.1628, 27.8695, 0.04),
        new("Cape Town CBD",               ["Adderley Street","Long Street","Buitenkant Street","Roeland Street"],  -33.9249, 18.4241, 0.02),
        new("Mitchells Plain, Cape Town",  ["Tafelsig Road","Merrydale Avenue","AZ Berman Drive"],                  -34.0444, 18.6175, 0.04),
        new("Khayelitsha, Cape Town",      ["Mew Way","Steve Biko Drive","Ntlazane Street"],                        -34.0347, 18.6939, 0.05),
        new("Durban CBD",                  ["Smith Street","Anton Lembede Street","Pine Street"],                   -29.8587, 31.0218, 0.02),
        new("Umhlanga, Durban",            ["Lighthouse Road","Ridge Road","McCausland Crescent"],                  -29.7270, 31.0756, 0.03),
        new("Umlazi, Durban",              ["Mangosuthu Highway","KwaMnyandu Road","Siyanda Drive"],                -29.9697, 30.8968, 0.04),
        new("Pretoria CBD",                ["Vermeulen Street","Paul Kruger Street","Church Street"],               -25.7479, 28.1878, 0.03),
        new("Mamelodi, Pretoria",          ["Tsamaya Road","Solomon Mahlangu Drive","Zone 7 Road"],                 -25.7174, 28.3978, 0.04),
        new("Soshanguve, Pretoria",        ["Block H Road","Soshanguve Highway","Zone 3 Road"],                     -25.5281, 28.0956, 0.05),
        new("Gqeberha CBD",                ["Govan Mbeki Avenue","Cape Road","Strand Street"],                      -33.9608, 25.6022, 0.03),
        new("Bloemfontein CBD",            ["President Brand Street","Maitland Street","Henry Street"],             -29.1210, 26.2041, 0.03),
        new("Kimberley CBD",               ["Dutoitspan Road","Lyndhurst Road","Jones Street"],                     -28.7282, 24.7499, 0.03),
        new("Polokwane CBD",               ["Schoeman Street","Bodenstein Street","Grobler Street"],                -23.9045, 29.4689, 0.03),
        new("Tembisa, Ekurhuleni",         ["Olifantsfontein Road","Plantation Road","Umthambeka Road"],            -25.9982, 28.2283, 0.04),
        new("Rustenburg CBD",              ["Kock Street","Nelson Mandela Drive","Beyers Naude Drive"],             -25.6675, 27.2423, 0.03),
    ];

    private record Template(string Title, string[] Descriptions, string[] Objects);

    private static readonly Dictionary<string, Template[]> Templates = new()
    {
        ["murder"] = [ new("Murder on {street}", ["A person was fatally shot on {street} in {loc}. {count} suspects fled in a {vehicle} {dir}. {outcome}", "Body discovered on {street}, {loc}. Victim sustained multiple gunshot wounds. {outcome}", "Fatal stabbing on {street} in {loc}. Victim pronounced dead at scene. {outcome}"], ["gun","weapon","person"]) ],
        ["sexual_offence"] = [ new("Sexual offence reported in {loc}", ["Victim reported a sexual assault near {street} in {loc}. {outcome}", "A sexual offence was reported to police in the {street} area of {loc}. {outcome}", "Incident of sexual violence reported near {street}, {loc}. Victim received medical assistance. {outcome}"], ["person"]) ],
        ["attempted_murder"] = [ new("Attempted murder on {street}", ["Victim was shot {count} times on {street} in {loc} and survived. Suspects fled in a {vehicle}.", "{count} suspects attacked victim with a firearm on {street}, {loc}. Victim hospitalised in critical condition. {outcome}", "Shooting on {street} in {loc} left victim critically wounded. Suspects fled {dir}. {outcome}"], ["gun","weapon","person"]) ],
        ["assault_gbh"] = [ new("Grievous assault on {street}", ["Victim assaulted with a weapon on {street} in {loc}. Sustained {injuries}. {outcome}", "{count} suspects attacked victim on {street}, {loc}. Victim transported to hospital with {injuries}.", "Violent assault near {street} in {loc}. Victim sustained {injuries} requiring hospitalisation. {outcome}"], ["person","knife","weapon"]) ],
        ["common_assault"] = [ new("Assault on {street}", ["Victim assaulted by {count} individuals on {street} in {loc}. Sustained {injuries}. {outcome}", "Altercation on {street}, {loc} resulted in physical assault. Victim sustained {injuries}. {outcome}", "Assault reported on {street} in {loc} following a dispute. {outcome}"], ["person"]) ],
        ["common_robbery"] = [ new("Robbery on {street}", ["Victim robbed by {count} suspects on {street} in {loc}. {stolen} taken. Suspects fled {dir}.", "{count} suspects approached victim on {street}, {loc} and demanded {stolen}. {outcome}", "Street robbery on {street} in {loc}. Victim surrendered {stolen}. {outcome}"], ["person"]) ],
        ["robbery_aggravating"] = [ new("Armed robbery on {street}", ["{count} armed suspects robbed {target} at gunpoint on {street}, {loc} and fled in a {vehicle} {dir}.", "Armed men stormed {target} on {street} in {loc}, brandished firearms and demanded cash. Fled in a {vehicle}.", "Suspects held up {target} at gunpoint near {street}, {loc}. {stolen} taken. Fled in a {vehicle} {dir}."], ["gun","weapon","person","car"]) ],
        ["carjacking"] = [ new("Vehicle hijacking on {street}", ["Motorist hijacked at traffic lights on {street}, {loc} by {count} armed suspects. {vehicle} taken. Driver unharmed.", "{count} suspects forced driver from their {vehicle} at {street} in {loc}. Fled {dir}.", "Driver stopped at red light on {street}, {loc} when suspects smashed window and stole the {vehicle}."], ["car","person","gun"]) ],
        ["robbery_residential"] = [ new("Home robbery on {street}", ["Armed suspects broke into residence on {street}, {loc} while occupants were home. {stolen} taken. {outcome}", "{count} suspects entered home on {street} in {loc} armed with firearms. Occupants restrained. {stolen} stolen. {outcome}", "Home invasion on {street}, {loc}. {count} suspects forced entry and robbed occupants at gunpoint. {outcome}"], ["gun","weapon","person"]) ],
        ["robbery_non_residential"] = [ new("Business robbery on {street}", ["Armed suspects robbed a business on {street}, {loc}. Staff threatened at gunpoint. {stolen} taken. {outcome}", "{count} armed suspects held up premises on {street} in {loc}. {stolen} taken. {outcome}", "Business robbery on {street}, {loc}. {count} suspects entered armed. Fled in a {vehicle}. {outcome}"], ["gun","person","car"]) ],
        ["arson"] = [ new("Arson at {street}", ["Structure on {street} in {loc} set alight by unknown suspects. Accelerant found. {outcome}", "Deliberate fire started at a property on {street}, {loc}. Arson investigators called. {outcome}", "Fire at premises on {street} in {loc} confirmed as arson. {outcome}"], ["fire","smoke","person"]) ],
        ["malicious_damage"] = [ new("Malicious damage on {street}", ["Property on {street} in {loc} damaged by unknown suspects overnight. {outcome}", "Suspects vandalised {target} on {street}, {loc}. Windows smashed. {outcome}", "Vehicle on {street} in {loc} deliberately damaged. {outcome}"], ["person","car"]) ],
        ["burglary_non_residential"] = [ new("Business burglary on {street}", ["Burglars broke into business on {street}, {loc} overnight. {stolen} stolen. {outcome}", "Business on {street} in {loc} burglarised after hours. {stolen} taken. {outcome}", "Break-in at commercial premises on {street}, {loc}. {stolen} stolen. {outcome}"], ["person","bag"]) ],
        ["burglary_residential"] = [ new("House break-in on {street}", ["Unknown suspects broke into residence on {street}, {loc}. {stolen} stolen. {outcome}", "Residents on {street} in {loc} returned to find home burglarised. {stolen} taken. {outcome}", "Home on {street}, {loc} burglarised while residents were away. {outcome}"], ["person","bag"]) ],
        ["motor_vehicle_theft"] = [ new("Motor vehicle theft on {street}", ["A {vehicle} was stolen from {street} in {loc}. {outcome}", "Vehicle theft reported on {street}, {loc}. Owner returned to find {vehicle} missing. {outcome}", "{vehicle} stolen from outside property on {street} in {loc} overnight. {outcome}"], ["car"]) ],
        ["theft_from_vehicle"] = [ new("Theft from vehicle on {street}", ["Suspects smashed window of parked vehicle on {street}, {loc} and stole {stolen}.", "Vehicle broken into on {street} in {loc}. {stolen} stolen from inside. {outcome}", "Parked vehicle on {street}, {loc} targeted by thieves. {stolen} taken. {outcome}"], ["car","person"]) ],
        ["stock_theft"] = [ new("Stock theft near {loc}", ["Farmer near {loc} reported {count} cattle stolen overnight. Tracks lead {dir}. {outcome}", "Stock theft syndicate targeted farm near {loc}. {count} livestock taken. {outcome}", "{count} head of cattle stolen from farm near {street}, {loc}. {outcome}"], ["person","truck"]) ],
        ["theft_general"] = [ new("Theft reported on {street}", ["Victim reported theft of {stolen} on {street} in {loc}. {outcome}", "{stolen} stolen from victim near {street}, {loc}. {outcome}", "Theft of {stolen} reported at {street} in {loc}. {outcome}"], ["person"]) ],
        ["commercial_crime"] = [ new("Commercial crime in {loc}", ["A business in {loc} reported fraud. {stolen} lost. {outcome}", "Commercial crime syndicate targeted businesses in the {street} area of {loc}. {outcome}", "Fraud detected at business on {street}, {loc}. {outcome}"], ["person"]) ],
        ["drug_related"] = [ new("Drug-related arrest on {street}", ["Police operation on {street} in {loc} resulted in arrest of {count} suspects in possession of drugs. {outcome}", "Drug dealing on {street}, {loc}. {count} suspects arrested. Drugs and cash seized. {outcome}", "Tip-off led to drug bust on {street} in {loc}. {count} suspects apprehended. {outcome}"], ["person","bag"]) ],
        ["illegal_firearms"] = [ new("Illegal firearm seized on {street}", ["Police seized an illegal firearm from suspect on {street} in {loc}. {outcome}", "{count} illegal firearms recovered during operation on {street}, {loc}. {count} suspects arrested. {outcome}", "Tip-off led to seizure of illegal firearms on {street} in {loc}. {outcome}"], ["gun","weapon","person"]) ],
        ["kidnapping"] = [ new("Kidnapping reported in {loc}", ["Family in {loc} reported a member kidnapped near {street}. Ransom demand received. {outcome}", "Victim abducted near {street}, {loc} by {count} suspects in a {vehicle}. {outcome}", "Person from {street} in {loc} confirmed as kidnapping victim. {outcome}"], ["person","car"]) ],
        ["cash_in_transit"] = [ new("Cash-in-transit heist near {loc}", ["Armoured vehicle ambushed by {count} heavily armed suspects near {street} in {loc}. Large cash amount stolen. {outcome}", "CIT vehicle attacked near {street}, {loc} using spike strips. Suspects fled in {count} vehicles. {outcome}", "Armed group ambushed cash transport near {street} in {loc}. Guards unharmed. {outcome}"], ["gun","weapon","car","explosion"]) ],
    };

    private static readonly string[] Vehicles   = ["silver Toyota Hilux","black VW Polo","white BMW 3 Series","red Ford Ranger","grey Toyota Corolla","blue Hyundai i20","white Toyota Quantum","silver Nissan NP200","maroon Nissan Almera"];
    private static readonly string[] Targets    = ["the cashier","shop staff","security personnel","the store manager","a delivery driver"];
    private static readonly string[] Stolen     = ["laptops, jewellery and cash","a laptop bag and cell phone","cash from the till","cell phones and wallets","electronic equipment","jewellery and wristwatches"];
    private static readonly string[] Injuries   = ["facial injuries","lacerations","a broken arm","bruising to the torso","stab wounds","gunshot wounds"];
    private static readonly string[] Outcomes   = ["Suspects fled before police arrived.","One suspect apprehended at scene.","Investigation ongoing.","No arrests made.","Case referred to detectives.","Two suspects arrested nearby."];
    private static readonly string[] Directions = ["towards the highway","into the township","towards the CBD","in an unknown direction","towards the N1","towards the N2"];

    public IReadOnlyList<GeneratedIncidentTrainingRow> Generate(int count)
    {
        var target      = count / 2;
        var positives   = 0;
        var negatives   = 0;
        var rows        = new List<GeneratedIncidentTrainingRow>(count);
        var maxAttempts = count * 20;
        var attempts    = 0;

        while (rows.Count < count && attempts < maxAttempts)
        {
            attempts++;
            var row = GenerateSingleRow();

            if (row.Label && positives < target)
            {
                rows.Add(row);
                positives++;
            }
            else if (!row.Label && negatives < target)
            {
                rows.Add(row);
                negatives++;
            }
        }

        // Shuffle so positives and negatives are not grouped together
        return rows.OrderBy(_ => Rng.Next()).ToList();
    }

    private GeneratedIncidentTrainingRow GenerateSingleRow()
    {
        var crime   = SampleCrimeByWeight();
        var loc     = Locations[Rng.Next(Locations.Length)];
        var street  = loc.Streets[Rng.Next(loc.Streets.Length)];
        var n       = Rng.Next(2, 6);

        string Fill(string t) => t
            .Replace("{street}",   street)
            .Replace("{loc}",      loc.Name)
            .Replace("{vehicle}",  Vehicles[Rng.Next(Vehicles.Length)])
            .Replace("{target}",   Targets[Rng.Next(Targets.Length)])
            .Replace("{stolen}",   Stolen[Rng.Next(Stolen.Length)])
            .Replace("{injuries}", Injuries[Rng.Next(Injuries.Length)])
            .Replace("{outcome}",  Outcomes[Rng.Next(Outcomes.Length)])
            .Replace("{dir}",      Directions[Rng.Next(Directions.Length)])
            .Replace("{count}",    n.ToString());

        var lat = Math.Round(loc.Lat + (Rng.NextDouble() - 0.5) * 2 * loc.Radius, 6);
        var lng = Math.Round(loc.Lng + (Rng.NextDouble() - 0.5) * 2 * loc.Radius, 6);

        var tg       = Templates.TryGetValue(crime.Category, out var t) ? t : Templates["theft_general"];
        var tmpl     = tg[Rng.Next(tg.Length)];
        var desc     = tmpl.Descriptions[Rng.Next(tmpl.Descriptions.Length)];

        var objCount = Rng.Next(1, Math.Min(4, tmpl.Objects.Length + 1));
        var objects  = tmpl.Objects.OrderBy(_ => Rng.Next()).Take(objCount).ToArray();

        var occurred    = DateTime.UtcNow.AddDays(-Rng.Next(0, 548)).AddHours(-Rng.Next(0, 24)).AddMinutes(-Rng.Next(0, 60));
        var reportDelay = TimeSpan.FromMinutes(Rng.Next(5, 360));
        var reported    = occurred + reportDelay;
        var created     = reported.AddMinutes(Rng.Next(0, 60));
        var hasModified = Rng.NextDouble() > 0.6;
        var isDeleted   = Rng.NextDouble() < 0.02;
        var anonymous   = Rng.NextDouble() < 0.28;
        var hasImage    = Rng.NextDouble() < 0.55;

        var row = new GeneratedIncidentTrainingRow
        {
            Id                   = Guid.NewGuid(),
            Title                = Fill(tmpl.Title),
            Description          = Fill(desc),
            Location             = $"{street}, {loc.Name}",
            AudioFile            = string.Empty,
            AudioFileName        = string.Empty,
            AudioContentType     = string.Empty,
            ImageFile            = string.Empty,
            ImageFileName        = string.Empty,
            ImageContentType     = string.Empty,
            Latitude             = (decimal)lat,
            Longitude            = (decimal)lng,
            CaseId               = Rng.NextDouble() < 0.45 ? Guid.NewGuid() : null,
            Anonymous            = anonymous,
            DetectedObjects      = JsonSerializer.Serialize(objects),
            OccurredAt           = occurred,
            ReportedAt           = reported,
            CreationTime         = created,
            CreatorId            = Guid.NewGuid(),
            LastModificationTime = hasModified ? created.AddHours(Rng.Next(1, 72)) : null,
            LastModifierId       = hasModified ? Guid.NewGuid() : null,
            IsDeleted            = isDeleted,
            DeleterId            = isDeleted ? Guid.NewGuid() : null,
            DeletionTime         = isDeleted ? created.AddDays(Rng.Next(1, 30)) : null,
            ConcurrencyStamp     = Guid.NewGuid(),
            CrimeCategory        = crime.Category,
        };

        row.CaseOpened   = SampleCaseOpened(crime, row, reportDelay, anonymous, hasImage);
        row.CaseResolved = row.CaseOpened && SampleCaseResolved(crime);
        row.Label        = row.CaseOpened;
        return row;
    }

    private static bool SampleCaseOpened(CrimeStats crime, GeneratedIncidentTrainingRow row,
        TimeSpan reportDelay, bool anonymous, bool hasImage)
    {
        var logOdds = Math.Log(crime.CaseOpenRate / (1.0 - crime.CaseOpenRate));
        if (reportDelay.TotalHours <= 1)      logOdds += 1.4;
        else if (reportDelay.TotalHours <= 6) logOdds += 0.8;
        else if (reportDelay.TotalHours > 48) logOdds -= 1.2;
        if (hasImage)        logOdds += 0.7;
        if (!anonymous)      logOdds += 0.5;
        if (crime.IsViolent) logOdds += 0.6;
        var hour = row.OccurredAt.Hour;
        if (hour >= 22 || hour <= 4) logOdds -= 0.3;
        if (row.OccurredAt.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday) logOdds -= 0.15;
        logOdds += Gaussian(0, 0.8);
        return Rng.NextDouble() < Sigmoid(logOdds);
    }

    private static bool SampleCaseResolved(CrimeStats crime)
    {
        var logOdds = Math.Log(crime.DetectionRate / (1.0 - crime.DetectionRate));
        if (crime.Category is "drug_related" or "illegal_firearms") logOdds += 0.5;
        if (crime.IsViolent)            logOdds += 0.3;
        if (crime.Category == "murder") logOdds += 0.4;
        logOdds += Gaussian(0, 1.0);
        return Rng.NextDouble() < Sigmoid(logOdds);
    }

    private static double Sigmoid(double x) => 1.0 / (1.0 + Math.Exp(-x));

    private static double Gaussian(double mean, double std)
    {
        var u1 = 1.0 - Rng.NextDouble();
        var u2 = 1.0 - Rng.NextDouble();
        return mean + std * Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);
    }
}