import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Int "mo:core/Int";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Migration "migration";
import Array "mo:core/Array";

(with migration = Migration.run)
actor {
  type BusinessType = {
    #barber;
    #petshop;
    #salon;
    #clinic;
  };

  type Client = {
    id : Nat;
    name : Text;
    phone : Text;
    email : Text;
    lastVisit : Time.Time;
    totalVisits : Nat;
    notes : Text;
    businessType : BusinessType;
  };

  module Client {
    public func compareByTotalVisits(a : Client, b : Client) : Order.Order {
      Nat.compare(b.totalVisits, a.totalVisits);
    };

    public func compareByLastVisit(a : Client, b : Client) : Order.Order {
      Int.compare(b.lastVisit, a.lastVisit);
    };
  };

  type AppointmentStatus = {
    #scheduled;
    #completed;
    #cancelled;
  };

  type Appointment = {
    id : Nat;
    clientId : Nat;
    service : Text;
    dateTime : Time.Time;
    duration : Nat;
    status : AppointmentStatus;
    notes : Text;
  };

  type FinancialType = {
    #income;
    #expense;
  };

  type FinancialRecord = {
    id : Nat;
    financialType : FinancialType;
    amount : Float;
    category : Text;
    date : Time.Time;
    description : Text;
    linkedAppointmentId : ?Nat;
  };

  module FinancialRecord {
    public func compareByDate(a : FinancialRecord, b : FinancialRecord) : Order.Order {
      Int.compare(b.date, a.date);
    };

    public func compareByAmount(a : FinancialRecord, b : FinancialRecord) : Order.Order {
      Float.compare(b.amount, a.amount);
    };
  };

  // Reminder type
  type Reminder = {
    clientName : Text;
    appointmentTime : Int;
    message : Text;
    reminderType : Text;
  };

  // Data stores
  let clients = Map.empty<Nat, Client>();
  let appointments = Map.empty<Nat, Appointment>();
  let financialRecords = Map.empty<Nat, FinancialRecord>();

  var nextClientId = 1;
  var nextAppointmentId = 1;
  var nextFinancialRecordId = 1;

  // Client CRUD
  public shared ({ caller }) func createClient(name : Text, phone : Text, email : Text, businessType : BusinessType) : async Client {
    let client : Client = {
      id = nextClientId;
      name;
      phone;
      email;
      lastVisit = Time.now();
      totalVisits = 0;
      notes = "";
      businessType;
    };
    clients.add(nextClientId, client);
    nextClientId += 1;
    client;
  };

  public query ({ caller }) func getClient(id : Nat) : async Client {
    switch (clients.get(id)) {
      case (null) { Runtime.trap("Client not found") };
      case (?client) { client };
    };
  };

  public shared ({ caller }) func updateClient(id : Nat, name : Text, phone : Text, email : Text, businessType : BusinessType, notes : Text) : async Client {
    switch (clients.get(id)) {
      case (null) { Runtime.trap("Client not found") };
      case (?client) {
        let updatedClient : Client = {
          client with name;
          phone;
          email;
          businessType;
          notes;
        };
        clients.add(id, updatedClient);
        updatedClient;
      };
    };
  };

  public shared ({ caller }) func deleteClient(id : Nat) : async () {
    if (not clients.containsKey(id)) {
      Runtime.trap("Client not found");
    };
    clients.remove(id);
  };

  // Appointment CRUD
  public shared ({ caller }) func createAppointment(clientId : Nat, service : Text, dateTime : Time.Time, duration : Nat, notes : Text) : async Appointment {
    let appointment : Appointment = {
      id = nextAppointmentId;
      clientId;
      service;
      dateTime;
      duration;
      status = #scheduled;
      notes;
    };
    appointments.add(nextAppointmentId, appointment);
    nextAppointmentId += 1;
    appointment;
  };

  public query ({ caller }) func getAppointment(id : Nat) : async Appointment {
    switch (appointments.get(id)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appointment) { appointment };
    };
  };

  public shared ({ caller }) func updateAppointmentStatus(id : Nat, status : AppointmentStatus) : async Appointment {
    switch (appointments.get(id)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appointment) {
        let updatedAppointment : Appointment = {
          appointment with status;
        };
        appointments.add(id, updatedAppointment);
        updatedAppointment;
      };
    };
  };

  public shared ({ caller }) func deleteAppointment(id : Nat) : async () {
    if (not appointments.containsKey(id)) {
      Runtime.trap("Appointment not found");
    };
    appointments.remove(id);
  };

  // Financial Record CRUD
  public shared ({ caller }) func createFinancialRecord(financialType : FinancialType, amount : Float, category : Text, date : Time.Time, description : Text, linkedAppointmentId : ?Nat) : async FinancialRecord {
    let record : FinancialRecord = {
      id = nextFinancialRecordId;
      financialType;
      amount;
      category;
      date;
      description;
      linkedAppointmentId;
    };
    financialRecords.add(nextFinancialRecordId, record);
    nextFinancialRecordId += 1;
    record;
  };

  public query ({ caller }) func getFinancialRecord(id : Nat) : async FinancialRecord {
    switch (financialRecords.get(id)) {
      case (null) { Runtime.trap("Financial record not found") };
      case (?record) { record };
    };
  };

  public shared ({ caller }) func deleteFinancialRecord(id : Nat) : async () {
    if (not financialRecords.containsKey(id)) {
      Runtime.trap("Financial record not found");
    };
    financialRecords.remove(id);
  };

  // Retention Insights
  public query ({ caller }) func getClientsNotVisitedSince(days : Nat) : async [Client] {
    let now = Time.now();
    let threshold = now - (days * 24 * 60 * 60 * 1000000000);

    let list = List.empty<Client>();
    for (client in clients.values()) {
      if (client.lastVisit < threshold) {
        list.add(client);
      };
    };
    list.reverse().toArray();
  };

  public query ({ caller }) func getTopClientsByVisits(limit : Nat) : async [Client] {
    let sorted = clients.values().toArray().sort(Client.compareByTotalVisits);
    if (sorted.size() <= limit) {
      sorted;
    } else {
      sorted.sliceToArray(0, limit);
    };
  };

  // Messaging Templates
  public query ({ caller }) func generateMessageTemplates(clientId : Nat, daysSinceLastVisit : Nat) : async [Text] {
    switch (clients.get(clientId)) {
      case (null) { Runtime.trap("Client not found") };
      case (?client) {
        let comebackOffer = "Hello " # client.name # ", it's been " # daysSinceLastVisit.toText() # " days since your last visit. We miss you! Enjoy a special discount on your next appointment.";
        let generalCheckIn = "Hi " # client.name # ", just checking in to see how you're doing. Let us know if you need any of our services again!";

        let templates = List.empty<Text>();
        templates.add(comebackOffer);
        templates.add(generalCheckIn);
        templates.reverse().toArray();
      };
    };
  };

  // Generate Reminders
  public query ({ caller }) func generateReminders() : async [Reminder] {
    let now = Time.now();
    let upcomingAppointments = appointments.values().toArray().filter(
      func(appt) {
        appt.status == #scheduled and appt.dateTime > now
      }
    );

    let allRemindersList = List.empty<Reminder>();

    for (appt in upcomingAppointments.values()) {
      let client = clients.get(appt.clientId);
      let clientName = switch (client) {
        case (null) { "Cliente" };
        case (?c) { c.name };
      };

      let reminder24h = {
        clientName;
        appointmentTime = appt.dateTime;
        message = "Olá " # clientName # ", lembrando que seu agendamento para " # appt.service # " está marcado para amanhã, às " # formatTime(appt.dateTime) # ". Qualquer dúvida, estou à disposição!";
        reminderType = "24h";
      };

      let reminder2h = {
        clientName;
        appointmentTime = appt.dateTime;
        message = "Oi " # clientName # ", passando para avisar que faltam 2 horas para o seu compromisso de " # appt.service # ". Espero te ver em breve!";
        reminderType = "2h";
      };

      allRemindersList.add(reminder24h);
      allRemindersList.add(reminder2h);
    };

    allRemindersList.reverse().toArray();
  };

  func formatTime(timestamp : Int) : Text {
    let minutes = (timestamp / (60 * 1000000000)) % 60;
    let hours = (timestamp / (60 * 60 * 1000000000)) % 24;
    let hourStr = if (hours < 10) { "0" # hours.toText() } else {
      hours.toText();
    };
    let minuteStr = if (minutes < 10) { "0" # minutes.toText() } else {
      minutes.toText();
    };

    hourStr # ":" # minuteStr;
  };

  // Additional query functions for statistics
  public query ({ caller }) func getTotalClients() : async Nat {
    clients.size();
  };

  public query ({ caller }) func getTotalAppointments() : async Nat {
    appointments.size();
  };

  public query ({ caller }) func getTotalFinancialRecords() : async Nat {
    financialRecords.size();
  };
};
