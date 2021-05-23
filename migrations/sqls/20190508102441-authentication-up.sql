CREATE TABLE lbstarter.auth_clients (
	id                   INT GENERATED ALWAYS AS IDENTITY,
	client_id            varchar(50)  NOT NULL ,
	client_secret        varchar(50)  NOT NULL ,
	redirect_url         varchar(200)   ,
	access_token_expiration integer DEFAULT 900 NOT NULL ,
	refresh_token_expiration integer DEFAULT 86400 NOT NULL ,
	auth_code_expiration integer DEFAULT 1800 NOT NULL ,
	secret               varchar(50)  NOT NULL ,
	created_on           timestamptz DEFAULT current_timestamp NOT NULL ,
	modified_on          timestamptz DEFAULT current_timestamp NOT NULL ,
	deleted              bool DEFAULT false NOT NULL ,
	user_ids             integer[],
	deleted_by          integer   ,
	deleted_on           timestamptz,
	CONSTRAINT pk_auth_clients_id PRIMARY KEY ( id )
);

insert into lbstarter.auth_clients
  (client_id, client_secret, secret) overriding system value
  values
  ('webapp','saqw21!@', 'plmnkoqazxsw');
