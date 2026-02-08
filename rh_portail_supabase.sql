--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-10-27 10:48:06

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 285 (class 1255 OID 33048)
-- Name: clean_string(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clean_string(text) RETURNS text
    LANGUAGE plpgsql
    AS $_$
BEGIN
    -- Remplacer les caractŠres probl‚matiques ou les convertir
    RETURN regexp_replace($1, '[^\x20-\x7E\xA0-\xFF]', '', 'g');
END;
$_$;


ALTER FUNCTION public.clean_string(text) OWNER TO postgres;

--
-- TOC entry 293 (class 1255 OID 84269)
-- Name: generate_thread_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_thread_id() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
      BEGIN
        RETURN 'thread_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || FLOOR(RANDOM() * 1000)::INTEGER;
      END;
      $$;


ALTER FUNCTION public.generate_thread_id() OWNER TO postgres;

--
-- TOC entry 288 (class 1255 OID 41306)
-- Name: update_date_modification(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_date_modification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.date_modification = CURRENT_TIMESTAMP; 
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_date_modification() OWNER TO postgres;

--
-- TOC entry 287 (class 1255 OID 41288)
-- Name: update_date_modification_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_date_modification_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW."date_modification" = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_date_modification_column() OWNER TO postgres;

--
-- TOC entry 292 (class 1255 OID 41386)
-- Name: update_evenement_modtime(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_evenement_modtime() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_evenement_modtime() OWNER TO postgres;

--
-- TOC entry 289 (class 1255 OID 41323)
-- Name: update_historique_departs_modtime(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_historique_departs_modtime() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.date_modification = NOW(); 
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_historique_departs_modtime() OWNER TO postgres;

--
-- TOC entry 295 (class 1255 OID 92333)
-- Name: update_messages_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_messages_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
         NEW.updated_at = CURRENT_TIMESTAMP;
         RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.update_messages_updated_at() OWNER TO postgres;

--
-- TOC entry 286 (class 1255 OID 41236)
-- Name: update_modified_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.date_traitement = now(); 
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_modified_column() OWNER TO postgres;

--
-- TOC entry 291 (class 1255 OID 41373)
-- Name: update_sanctions_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_sanctions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_sanctions_updated_at() OWNER TO postgres;

--
-- TOC entry 294 (class 1255 OID 41286)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- TOC entry 290 (class 1255 OID 41337)
-- Name: update_visites_date_modification_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_visites_date_modification_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW."date_modification" = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_visites_date_modification_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 41275)
-- Name: absence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.absence (
    id integer NOT NULL,
    nom_employe character varying(255) NOT NULL,
    service character varying(255),
    poste character varying(255),
    type_absence character varying(100),
    motif text,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    statut character varying(10) DEFAULT 'En attente'::character varying,
    date_traitement timestamp without time zone,
    document_path character varying(255),
    date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    date_retour date,
    remuneration character varying(50),
    date_modification timestamp without time zone
);


ALTER TABLE public.absence OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 41274)
-- Name: absence_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.absence_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.absence_id_seq OWNER TO postgres;

--
-- TOC entry 5294 (class 0 OID 0)
-- Dependencies: 229
-- Name: absence_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.absence_id_seq OWNED BY public.absence.id;


--
-- TOC entry 228 (class 1259 OID 41263)
-- Name: absences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.absences (
    id integer NOT NULL,
    nom_employe character varying(255) NOT NULL,
    service character varying(255),
    poste character varying(255),
    type_absence character varying(100),
    motif text,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    statut character varying(20) DEFAULT 'En attente'::character varying,
    date_traitement timestamp without time zone,
    document_path character varying(255),
    date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    date_retour date,
    remuneration character varying(50),
    date_modification timestamp without time zone
);


ALTER TABLE public.absences OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 41262)
-- Name: absences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.absences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.absences_id_seq OWNER TO postgres;

--
-- TOC entry 5295 (class 0 OID 0)
-- Dependencies: 227
-- Name: absences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.absences_id_seq OWNED BY public.absences.id;


--
-- TOC entry 226 (class 1259 OID 41238)
-- Name: conges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conges (
    id integer NOT NULL,
    nom_employe character varying(255) NOT NULL,
    service character varying(255),
    poste character varying(255),
    date_embauche date,
    jours_conges_annuels integer,
    date_demande date DEFAULT CURRENT_DATE,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    motif text,
    date_retour date,
    jours_pris integer,
    jours_restants integer,
    date_prochaine_attribution date,
    type_conge character varying(50) DEFAULT 'Cong‚ pay‚'::character varying,
    statut character varying(20) DEFAULT 'En attente'::character varying,
    date_traitement timestamp without time zone,
    document_path character varying(255)
);


ALTER TABLE public.conges OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 41237)
-- Name: conges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conges_id_seq OWNER TO postgres;

--
-- TOC entry 5296 (class 0 OID 0)
-- Dependencies: 225
-- Name: conges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conges_id_seq OWNED BY public.conges.id;


--
-- TOC entry 252 (class 1259 OID 59330)
-- Name: contrats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contrats (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    type_contrat character varying(100) NOT NULL,
    date_debut date NOT NULL,
    date_fin date,
    statut character varying(50) DEFAULT 'Actif'::character varying,
    salaire numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    poste character varying(255),
    service character varying(255),
    contrat_content text,
    numero_contrat character varying,
    titre_poste character varying,
    departement character varying,
    salaire_brut numeric(12,2),
    salaire_net numeric(12,2),
    type_remuneration character varying,
    mode_paiement character varying,
    periode_essai integer,
    date_fin_essai date,
    lieu_travail character varying,
    horaires_travail character varying,
    superieur_hierarchique character varying,
    motif_contrat character varying,
    conditions_particulieres text,
    avantages_sociaux text,
    date_signature date,
    date_effet date,
    motif_resiliation character varying,
    date_resiliation date,
    notes text
);


ALTER TABLE public.contrats OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 59329)
-- Name: contrats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contrats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contrats_id_seq OWNER TO postgres;

--
-- TOC entry 5297 (class 0 OID 0)
-- Dependencies: 251
-- Name: contrats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contrats_id_seq OWNED BY public.contrats.id;


--
-- TOC entry 248 (class 1259 OID 59308)
-- Name: depart_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.depart_history (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    date_depart date NOT NULL,
    motif_depart text,
    type_depart character varying(100),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.depart_history OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 59307)
-- Name: depart_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.depart_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.depart_history_id_seq OWNER TO postgres;

--
-- TOC entry 5298 (class 0 OID 0)
-- Dependencies: 247
-- Name: depart_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.depart_history_id_seq OWNED BY public.depart_history.id;


--
-- TOC entry 220 (class 1259 OID 33037)
-- Name: effectif; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.effectif (
    id integer NOT NULL,
    statut_dossier character varying(255),
    matricule character varying(50),
    nom_prenom character varying(255) NOT NULL,
    genre character varying(10),
    date_naissance date,
    age integer,
    age_restant integer,
    date_retraite date,
    date_entree date,
    lieu character varying(100),
    adresse character varying(255),
    telephone character varying(50),
    email character varying(255),
    cnss_number character varying(50),
    cnamgs_number character varying(50),
    poste_actuel character varying(255),
    type_contrat character varying(50),
    date_fin_contrat date,
    employee_type character varying(50),
    nationalite character varying(100),
    functional_area character varying(100),
    entity character varying(50),
    responsable character varying(100),
    statut_employe character varying(50),
    statut_marital character varying(50),
    enfants integer,
    niveau_etude character varying(100),
    anciennete character varying(50),
    specialisation text,
    type_remuneration character varying(50),
    payment_mode character varying(50),
    categorie character varying(50),
    salaire_base numeric(10,2),
    salaire_net numeric(10,2),
    prime_responsabilite numeric(10,2),
    prime_penibilite numeric(10,2),
    prime_logement numeric(10,2),
    prime_transport numeric(10,2),
    prime_anciennete numeric(10,2),
    prime_enfant numeric(10,2),
    prime_representation numeric(10,2),
    prime_performance numeric(10,2),
    prime_astreinte numeric(10,2),
    honoraires numeric(10,2),
    indemnite_stage numeric(10,2),
    timemoto_id character varying(50),
    password character varying(255),
    emergency_contact character varying(100),
    emergency_phone character varying(50),
    last_login timestamp without time zone,
    password_initialized boolean DEFAULT false,
    first_login_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.effectif OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 33036)
-- Name: effectif_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.effectif_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.effectif_id_seq OWNER TO postgres;

--
-- TOC entry 5299 (class 0 OID 0)
-- Dependencies: 219
-- Name: effectif_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.effectif_id_seq OWNED BY public.effectif.id;


--
-- TOC entry 224 (class 1259 OID 41217)
-- Name: employee_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_documents (
    id integer NOT NULL,
    employee_id integer,
    document_type character varying(50) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(255) NOT NULL,
    upload_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employee_documents OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 41216)
-- Name: employee_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_documents_id_seq OWNER TO postgres;

--
-- TOC entry 5300 (class 0 OID 0)
-- Dependencies: 223
-- Name: employee_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_documents_id_seq OWNED BY public.employee_documents.id;


--
-- TOC entry 260 (class 1259 OID 67497)
-- Name: employee_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_notifications (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(100),
    related_id integer,
    related_type character varying(100),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    read_at timestamp without time zone
);


ALTER TABLE public.employee_notifications OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 67496)
-- Name: employee_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5301 (class 0 OID 0)
-- Dependencies: 259
-- Name: employee_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_notifications_id_seq OWNED BY public.employee_notifications.id;


--
-- TOC entry 238 (class 1259 OID 41345)
-- Name: employee_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_requests (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    request_type character varying(50) NOT NULL,
    request_details text,
    start_date date,
    end_date date,
    reason text,
    status character varying(20) DEFAULT 'pending'::character varying,
    request_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    response_date timestamp without time zone,
    response_comments text,
    start_time time without time zone,
    end_time time without time zone
);


ALTER TABLE public.employee_requests OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 41344)
-- Name: employee_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_requests_id_seq OWNER TO postgres;

--
-- TOC entry 5302 (class 0 OID 0)
-- Dependencies: 237
-- Name: employee_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_requests_id_seq OWNED BY public.employee_requests.id;


--
-- TOC entry 222 (class 1259 OID 33073)
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    statut_dossier character varying(255),
    matricule character varying(50),
    nom_prenom character varying(255) NOT NULL,
    genre character varying(10),
    date_naissance date,
    age integer,
    age_restant integer,
    date_retraite date,
    date_entree date,
    lieu character varying(100),
    adresse character varying(255),
    telephone character varying(50),
    email character varying(255),
    cnss_number character varying(50),
    cnamgs_number character varying(50),
    poste_actuel character varying(255),
    type_contrat character varying(50),
    date_fin_contrat date,
    employee_type character varying(50),
    nationalite character varying(100),
    functional_area character varying(100),
    entity character varying(50),
    responsable character varying(100),
    statut_employe character varying(50),
    statut_marital character varying(50),
    enfants integer,
    niveau_etude character varying(100),
    anciennete character varying(50),
    specialisation text,
    type_remuneration character varying(50),
    payment_mode character varying(50),
    categorie character varying(50),
    salaire_base numeric(10,2),
    salaire_net numeric(10,2),
    prime_responsabilite numeric(10,2),
    prime_penibilite numeric(10,2),
    prime_logement numeric(10,2),
    prime_transport numeric(10,2),
    prime_anciennete numeric(10,2),
    prime_enfant numeric(10,2),
    prime_representation numeric(10,2),
    prime_performance numeric(10,2),
    prime_astreinte numeric(10,2),
    honoraires numeric(10,2),
    indemnite_stage numeric(10,2),
    timemoto_id character varying(50),
    password character varying(255),
    emergency_contact character varying(100),
    emergency_phone character varying(50),
    last_login timestamp without time zone,
    password_initialized boolean DEFAULT false,
    first_login_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    departement character varying(255) DEFAULT ''::character varying,
    domaine_fonctionnel character varying(255) DEFAULT ''::character varying,
    statut character varying(50) DEFAULT 'Actif'::character varying,
    date_depart date,
    contact_urgence character varying,
    telephone_urgence character varying,
    mode_paiement character varying,
    photo_path character varying(255)
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- TOC entry 5303 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN employees.photo_path; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.employees.photo_path IS 'Chemin vers la photo de profil de l''employé';


--
-- TOC entry 221 (class 1259 OID 33072)
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- TOC entry 5304 (class 0 OID 0)
-- Dependencies: 221
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- TOC entry 242 (class 1259 OID 41376)
-- Name: evenements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evenements (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    date date NOT NULL,
    location character varying(255) NOT NULL,
    description text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.evenements OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 41375)
-- Name: evenements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.evenements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evenements_id_seq OWNER TO postgres;

--
-- TOC entry 5305 (class 0 OID 0)
-- Dependencies: 241
-- Name: evenements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evenements_id_seq OWNED BY public.evenements.id;


--
-- TOC entry 258 (class 1259 OID 67477)
-- Name: file_action_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.file_action_history (
    id integer NOT NULL,
    file_id integer NOT NULL,
    action_type character varying(50) NOT NULL,
    action_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    action_by integer NOT NULL,
    action_details text,
    ip_address character varying(45)
);


ALTER TABLE public.file_action_history OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 67476)
-- Name: file_action_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.file_action_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_action_history_id_seq OWNER TO postgres;

--
-- TOC entry 5306 (class 0 OID 0)
-- Dependencies: 257
-- Name: file_action_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.file_action_history_id_seq OWNED BY public.file_action_history.id;


--
-- TOC entry 256 (class 1259 OID 67466)
-- Name: file_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.file_comments (
    id integer NOT NULL,
    file_id integer NOT NULL,
    commenter_id integer NOT NULL,
    comment_text text NOT NULL,
    comment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_internal boolean DEFAULT false
);


ALTER TABLE public.file_comments OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 67465)
-- Name: file_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.file_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_comments_id_seq OWNER TO postgres;

--
-- TOC entry 5307 (class 0 OID 0)
-- Dependencies: 255
-- Name: file_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.file_comments_id_seq OWNED BY public.file_comments.id;


--
-- TOC entry 234 (class 1259 OID 41309)
-- Name: historique_departs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historique_departs (
    id integer NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    departement character varying(100) NOT NULL,
    statut character varying(50) NOT NULL,
    poste character varying(100) NOT NULL,
    date_depart date NOT NULL,
    motif_depart character varying(100) NOT NULL,
    commentaire text,
    date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    date_modification timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.historique_departs OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 41308)
-- Name: historique_departs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historique_departs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historique_departs_id_seq OWNER TO postgres;

--
-- TOC entry 5308 (class 0 OID 0)
-- Dependencies: 233
-- Name: historique_departs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historique_departs_id_seq OWNED BY public.historique_departs.id;


--
-- TOC entry 232 (class 1259 OID 41291)
-- Name: historique_recrutement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historique_recrutement (
    id integer NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    departement character varying(100) NOT NULL,
    motif_recrutement character varying(100) NOT NULL,
    date_recrutement date NOT NULL,
    type_contrat character varying(50) NOT NULL,
    poste character varying(100) NOT NULL,
    superieur_hierarchique character varying(100) NOT NULL,
    date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    date_modification timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cv_path character varying(255) DEFAULT NULL::character varying,
    notes text
);


ALTER TABLE public.historique_recrutement OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 41290)
-- Name: historique_recrutement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historique_recrutement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historique_recrutement_id_seq OWNER TO postgres;

--
-- TOC entry 5309 (class 0 OID 0)
-- Dependencies: 231
-- Name: historique_recrutement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historique_recrutement_id_seq OWNED BY public.historique_recrutement.id;


--
-- TOC entry 264 (class 1259 OID 76031)
-- Name: hr_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hr_tasks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    priority character varying(50) DEFAULT 'Moyenne'::character varying,
    status character varying(50) DEFAULT 'Planifié'::character varying,
    assigned_to character varying(255) NOT NULL,
    due_date date NOT NULL,
    category character varying(100) DEFAULT 'Général'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.hr_tasks OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 76030)
-- Name: hr_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hr_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hr_tasks_id_seq OWNER TO postgres;

--
-- TOC entry 5310 (class 0 OID 0)
-- Dependencies: 263
-- Name: hr_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hr_tasks_id_seq OWNED BY public.hr_tasks.id;


--
-- TOC entry 262 (class 1259 OID 76018)
-- Name: interviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interviews (
    id integer NOT NULL,
    candidate_name character varying(255) NOT NULL,
    "position" character varying(255) NOT NULL,
    interview_date date NOT NULL,
    interview_time time without time zone NOT NULL,
    interviewer character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'Planifié'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    duration integer DEFAULT 60,
    interview_type character varying(50) DEFAULT 'face_to_face'::character varying,
    location character varying(255),
    department character varying(255)
);


ALTER TABLE public.interviews OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 76017)
-- Name: interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.interviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interviews_id_seq OWNER TO postgres;

--
-- TOC entry 5311 (class 0 OID 0)
-- Dependencies: 261
-- Name: interviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.interviews_id_seq OWNED BY public.interviews.id;


--
-- TOC entry 284 (class 1259 OID 92316)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer NOT NULL,
    sender_name character varying(255) NOT NULL,
    sender_type character varying(50) NOT NULL,
    receiver_id integer NOT NULL,
    receiver_name character varying(255) NOT NULL,
    receiver_type character varying(50) NOT NULL,
    content text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT messages_receiver_type_check CHECK (((receiver_type)::text = ANY ((ARRAY['rh'::character varying, 'employee'::character varying])::text[]))),
    CONSTRAINT messages_sender_type_check CHECK (((sender_type)::text = ANY ((ARRAY['rh'::character varying, 'employee'::character varying])::text[])))
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 92315)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- TOC entry 5312 (class 0 OID 0)
-- Dependencies: 283
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 244 (class 1259 OID 41390)
-- Name: notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    full_note_number character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    title character varying(100) NOT NULL,
    content text NOT NULL,
    is_public boolean DEFAULT false,
    created_by character varying(100) DEFAULT 'Admin RH'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notes OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 41389)
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notes_id_seq OWNER TO postgres;

--
-- TOC entry 5313 (class 0 OID 0)
-- Dependencies: 243
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- TOC entry 246 (class 1259 OID 59298)
-- Name: offboarding_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offboarding_history (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    date_depart date NOT NULL,
    motif_depart text,
    checklist jsonb,
    documents text[],
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.offboarding_history OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 59297)
-- Name: offboarding_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.offboarding_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.offboarding_history_id_seq OWNER TO postgres;

--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 245
-- Name: offboarding_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.offboarding_history_id_seq OWNED BY public.offboarding_history.id;


--
-- TOC entry 268 (class 1259 OID 84131)
-- Name: onboarding_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.onboarding_history (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    date_integration date NOT NULL,
    checklist jsonb,
    documents text[],
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.onboarding_history OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 84130)
-- Name: onboarding_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.onboarding_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.onboarding_history_id_seq OWNER TO postgres;

--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 267
-- Name: onboarding_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.onboarding_history_id_seq OWNED BY public.onboarding_history.id;


--
-- TOC entry 278 (class 1259 OID 84209)
-- Name: procedure_commentaires; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procedure_commentaires (
    id integer NOT NULL,
    dossier_id integer,
    admin_id integer,
    commentaire text NOT NULL,
    type character varying(50) DEFAULT 'note'::character varying,
    date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.procedure_commentaires OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 84208)
-- Name: procedure_commentaires_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.procedure_commentaires_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.procedure_commentaires_id_seq OWNER TO postgres;

--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 277
-- Name: procedure_commentaires_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.procedure_commentaires_id_seq OWNED BY public.procedure_commentaires.id;


--
-- TOC entry 274 (class 1259 OID 84170)
-- Name: procedure_documents_requis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procedure_documents_requis (
    id integer NOT NULL,
    etape_id integer,
    nom_document character varying(255) NOT NULL,
    description text,
    obligatoire boolean DEFAULT true,
    ordre integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.procedure_documents_requis OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 84169)
-- Name: procedure_documents_requis_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.procedure_documents_requis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.procedure_documents_requis_id_seq OWNER TO postgres;

--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 273
-- Name: procedure_documents_requis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.procedure_documents_requis_id_seq OWNED BY public.procedure_documents_requis.id;


--
-- TOC entry 276 (class 1259 OID 84187)
-- Name: procedure_documents_soumis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procedure_documents_soumis (
    id integer NOT NULL,
    dossier_id integer,
    document_requis_id integer,
    nom_fichier character varying(255) NOT NULL,
    chemin_fichier character varying(500) NOT NULL,
    taille_fichier integer,
    type_mime character varying(100),
    statut character varying(50) DEFAULT 'en_attente'::character varying,
    commentaire text,
    date_soumission timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    date_validation timestamp without time zone,
    valide_par integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.procedure_documents_soumis OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 84186)
-- Name: procedure_documents_soumis_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.procedure_documents_soumis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.procedure_documents_soumis_id_seq OWNER TO postgres;

--
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 275
-- Name: procedure_documents_soumis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.procedure_documents_soumis_id_seq OWNED BY public.procedure_documents_soumis.id;


--
-- TOC entry 270 (class 1259 OID 84141)
-- Name: procedure_dossiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procedure_dossiers (
    id integer NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    telephone character varying(20),
    nationalite character varying(100),
    specialite character varying(100),
    universite character varying(255),
    diplome_pays character varying(100),
    statut character varying(50) DEFAULT 'nouveau'::character varying,
    date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    derniere_modification timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    commentaire text,
    lien_acces character varying(500),
    token_acces character varying(255),
    date_expiration_token timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.procedure_dossiers OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 84140)
-- Name: procedure_dossiers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.procedure_dossiers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.procedure_dossiers_id_seq OWNER TO postgres;

--
-- TOC entry 5319 (class 0 OID 0)
-- Dependencies: 269
-- Name: procedure_dossiers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.procedure_dossiers_id_seq OWNED BY public.procedure_dossiers.id;


--
-- TOC entry 272 (class 1259 OID 84157)
-- Name: procedure_etapes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procedure_etapes (
    id integer NOT NULL,
    nom character varying(100) NOT NULL,
    titre character varying(255) NOT NULL,
    couleur character varying(50) DEFAULT 'primary'::character varying,
    ordre integer NOT NULL,
    next_step character varying(100),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.procedure_etapes OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 84156)
-- Name: procedure_etapes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.procedure_etapes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.procedure_etapes_id_seq OWNER TO postgres;

--
-- TOC entry 5320 (class 0 OID 0)
-- Dependencies: 271
-- Name: procedure_etapes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.procedure_etapes_id_seq OWNED BY public.procedure_etapes.id;


--
-- TOC entry 280 (class 1259 OID 84225)
-- Name: procedure_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procedure_notifications (
    id integer NOT NULL,
    dossier_id integer,
    type character varying(50) NOT NULL,
    destinataire character varying(255) NOT NULL,
    sujet character varying(255),
    contenu text,
    statut character varying(50) DEFAULT 'envoye'::character varying,
    date_envoi timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    date_reception timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.procedure_notifications OWNER TO postgres;

--
-- TOC entry 279 (class 1259 OID 84224)
-- Name: procedure_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.procedure_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.procedure_notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5321 (class 0 OID 0)
-- Dependencies: 279
-- Name: procedure_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.procedure_notifications_id_seq OWNED BY public.procedure_notifications.id;


--
-- TOC entry 282 (class 1259 OID 84242)
-- Name: procedure_statistiques; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procedure_statistiques (
    id integer NOT NULL,
    date_statistique date DEFAULT CURRENT_DATE,
    total_dossiers integer DEFAULT 0,
    nouveaux_dossiers integer DEFAULT 0,
    en_cours integer DEFAULT 0,
    completes integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.procedure_statistiques OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 84241)
-- Name: procedure_statistiques_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.procedure_statistiques_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.procedure_statistiques_id_seq OWNER TO postgres;

--
-- TOC entry 5322 (class 0 OID 0)
-- Dependencies: 281
-- Name: procedure_statistiques_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.procedure_statistiques_id_seq OWNED BY public.procedure_statistiques.id;


--
-- TOC entry 250 (class 1259 OID 59318)
-- Name: recrutement_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recrutement_history (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    date_recrutement date NOT NULL,
    date_fin date,
    poste_recrute character varying(255),
    type_contrat character varying(100),
    salaire_propose numeric(10,2),
    source_recrutement character varying(255),
    statut character varying(50) DEFAULT 'Recruté'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text
);


ALTER TABLE public.recrutement_history OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 59317)
-- Name: recrutement_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recrutement_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recrutement_history_id_seq OWNER TO postgres;

--
-- TOC entry 5323 (class 0 OID 0)
-- Dependencies: 249
-- Name: recrutement_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recrutement_history_id_seq OWNED BY public.recrutement_history.id;


--
-- TOC entry 254 (class 1259 OID 67455)
-- Name: request_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request_files (
    id integer NOT NULL,
    request_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer NOT NULL,
    file_type character varying(100) NOT NULL,
    upload_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    uploaded_by integer NOT NULL,
    description text,
    is_approved boolean DEFAULT false,
    approval_date timestamp without time zone,
    approved_by integer,
    approval_comments text
);


ALTER TABLE public.request_files OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 67454)
-- Name: request_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.request_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.request_files_id_seq OWNER TO postgres;

--
-- TOC entry 5324 (class 0 OID 0)
-- Dependencies: 253
-- Name: request_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.request_files_id_seq OWNED BY public.request_files.id;


--
-- TOC entry 240 (class 1259 OID 41360)
-- Name: sanctions_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sanctions_table (
    id integer NOT NULL,
    nom_employe character varying(100) NOT NULL,
    type_sanction character varying(50) NOT NULL,
    contenu_sanction text NOT NULL,
    date date NOT NULL,
    statut character varying(20) DEFAULT 'En cours'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sanctions_table OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 41359)
-- Name: sanctions_table_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sanctions_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sanctions_table_id_seq OWNER TO postgres;

--
-- TOC entry 5325 (class 0 OID 0)
-- Dependencies: 239
-- Name: sanctions_table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sanctions_table_id_seq OWNED BY public.sanctions_table.id;


--
-- TOC entry 266 (class 1259 OID 84113)
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    assignee character varying(255) NOT NULL,
    priority character varying(50) DEFAULT 'medium'::character varying,
    status character varying(50) DEFAULT 'pending'::character varying,
    due_date date NOT NULL,
    category character varying(100),
    estimated_hours integer,
    progress integer DEFAULT 0,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 84112)
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO postgres;

--
-- TOC entry 5326 (class 0 OID 0)
-- Dependencies: 265
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- TOC entry 236 (class 1259 OID 41326)
-- Name: visites_medicales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visites_medicales (
    id integer NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    poste character varying(100) NOT NULL,
    date_derniere_visite date NOT NULL,
    date_prochaine_visite date NOT NULL,
    statut character varying(50) DEFAULT 'A venir'::character varying NOT NULL,
    notes text,
    date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    date_modification timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.visites_medicales OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 41325)
-- Name: visites_medicales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.visites_medicales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.visites_medicales_id_seq OWNER TO postgres;

--
-- TOC entry 5327 (class 0 OID 0)
-- Dependencies: 235
-- Name: visites_medicales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.visites_medicales_id_seq OWNED BY public.visites_medicales.id;


--
-- TOC entry 4835 (class 2604 OID 41278)
-- Name: absence id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absence ALTER COLUMN id SET DEFAULT nextval('public.absence_id_seq'::regclass);


--
-- TOC entry 4831 (class 2604 OID 41266)
-- Name: absences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absences ALTER COLUMN id SET DEFAULT nextval('public.absences_id_seq'::regclass);


--
-- TOC entry 4827 (class 2604 OID 41241)
-- Name: conges id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conges ALTER COLUMN id SET DEFAULT nextval('public.conges_id_seq'::regclass);


--
-- TOC entry 4873 (class 2604 OID 59333)
-- Name: contrats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats ALTER COLUMN id SET DEFAULT nextval('public.contrats_id_seq'::regclass);


--
-- TOC entry 4867 (class 2604 OID 59311)
-- Name: depart_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depart_history ALTER COLUMN id SET DEFAULT nextval('public.depart_history_id_seq'::regclass);


--
-- TOC entry 4814 (class 2604 OID 33040)
-- Name: effectif id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.effectif ALTER COLUMN id SET DEFAULT nextval('public.effectif_id_seq'::regclass);


--
-- TOC entry 4825 (class 2604 OID 41220)
-- Name: employee_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_documents ALTER COLUMN id SET DEFAULT nextval('public.employee_documents_id_seq'::regclass);


--
-- TOC entry 4885 (class 2604 OID 67500)
-- Name: employee_notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_notifications ALTER COLUMN id SET DEFAULT nextval('public.employee_notifications_id_seq'::regclass);


--
-- TOC entry 4850 (class 2604 OID 41348)
-- Name: employee_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_requests ALTER COLUMN id SET DEFAULT nextval('public.employee_requests_id_seq'::regclass);


--
-- TOC entry 4818 (class 2604 OID 33076)
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- TOC entry 4857 (class 2604 OID 41379)
-- Name: evenements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenements ALTER COLUMN id SET DEFAULT nextval('public.evenements_id_seq'::regclass);


--
-- TOC entry 4883 (class 2604 OID 67480)
-- Name: file_action_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_action_history ALTER COLUMN id SET DEFAULT nextval('public.file_action_history_id_seq'::regclass);


--
-- TOC entry 4880 (class 2604 OID 67469)
-- Name: file_comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_comments ALTER COLUMN id SET DEFAULT nextval('public.file_comments_id_seq'::regclass);


--
-- TOC entry 4843 (class 2604 OID 59347)
-- Name: historique_departs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_departs ALTER COLUMN id SET DEFAULT nextval('public.historique_departs_id_seq'::regclass);


--
-- TOC entry 4839 (class 2604 OID 41294)
-- Name: historique_recrutement id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_recrutement ALTER COLUMN id SET DEFAULT nextval('public.historique_recrutement_id_seq'::regclass);


--
-- TOC entry 4894 (class 2604 OID 76034)
-- Name: hr_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hr_tasks ALTER COLUMN id SET DEFAULT nextval('public.hr_tasks_id_seq'::regclass);


--
-- TOC entry 4888 (class 2604 OID 76021)
-- Name: interviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews ALTER COLUMN id SET DEFAULT nextval('public.interviews_id_seq'::regclass);


--
-- TOC entry 4939 (class 2604 OID 92319)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 4860 (class 2604 OID 41393)
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- TOC entry 4865 (class 2604 OID 59301)
-- Name: offboarding_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offboarding_history ALTER COLUMN id SET DEFAULT nextval('public.offboarding_history_id_seq'::regclass);


--
-- TOC entry 4906 (class 2604 OID 84134)
-- Name: onboarding_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_history ALTER COLUMN id SET DEFAULT nextval('public.onboarding_history_id_seq'::regclass);


--
-- TOC entry 4925 (class 2604 OID 84212)
-- Name: procedure_commentaires id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_commentaires ALTER COLUMN id SET DEFAULT nextval('public.procedure_commentaires_id_seq'::regclass);


--
-- TOC entry 4917 (class 2604 OID 84173)
-- Name: procedure_documents_requis id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_documents_requis ALTER COLUMN id SET DEFAULT nextval('public.procedure_documents_requis_id_seq'::regclass);


--
-- TOC entry 4921 (class 2604 OID 84190)
-- Name: procedure_documents_soumis id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_documents_soumis ALTER COLUMN id SET DEFAULT nextval('public.procedure_documents_soumis_id_seq'::regclass);


--
-- TOC entry 4908 (class 2604 OID 84144)
-- Name: procedure_dossiers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_dossiers ALTER COLUMN id SET DEFAULT nextval('public.procedure_dossiers_id_seq'::regclass);


--
-- TOC entry 4914 (class 2604 OID 84160)
-- Name: procedure_etapes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_etapes ALTER COLUMN id SET DEFAULT nextval('public.procedure_etapes_id_seq'::regclass);


--
-- TOC entry 4928 (class 2604 OID 84228)
-- Name: procedure_notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_notifications ALTER COLUMN id SET DEFAULT nextval('public.procedure_notifications_id_seq'::regclass);


--
-- TOC entry 4932 (class 2604 OID 84245)
-- Name: procedure_statistiques id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_statistiques ALTER COLUMN id SET DEFAULT nextval('public.procedure_statistiques_id_seq'::regclass);


--
-- TOC entry 4869 (class 2604 OID 59321)
-- Name: recrutement_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recrutement_history ALTER COLUMN id SET DEFAULT nextval('public.recrutement_history_id_seq'::regclass);


--
-- TOC entry 4877 (class 2604 OID 67458)
-- Name: request_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_files ALTER COLUMN id SET DEFAULT nextval('public.request_files_id_seq'::regclass);


--
-- TOC entry 4853 (class 2604 OID 41363)
-- Name: sanctions_table id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sanctions_table ALTER COLUMN id SET DEFAULT nextval('public.sanctions_table_id_seq'::regclass);


--
-- TOC entry 4900 (class 2604 OID 84116)
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- TOC entry 4846 (class 2604 OID 41329)
-- Name: visites_medicales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visites_medicales ALTER COLUMN id SET DEFAULT nextval('public.visites_medicales_id_seq'::regclass);


--
-- TOC entry 5234 (class 0 OID 41275)
-- Dependencies: 230
-- Data for Name: absence; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5232 (class 0 OID 41263)
-- Dependencies: 228
-- Data for Name: absences; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5230 (class 0 OID 41238)
-- Dependencies: 226
-- Data for Name: conges; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5256 (class 0 OID 59330)
-- Dependencies: 252
-- Data for Name: contrats; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5252 (class 0 OID 59308)
-- Dependencies: 248
-- Data for Name: depart_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5224 (class 0 OID 33037)
-- Dependencies: 220
-- Data for Name: effectif; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5228 (class 0 OID 41217)
-- Dependencies: 224
-- Data for Name: employee_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5264 (class 0 OID 67497)
-- Dependencies: 260
-- Data for Name: employee_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5242 (class 0 OID 41345)
-- Dependencies: 238
-- Data for Name: employee_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5226 (class 0 OID 33073)
-- Dependencies: 222
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5246 (class 0 OID 41376)
-- Dependencies: 242
-- Data for Name: evenements; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5262 (class 0 OID 67477)
-- Dependencies: 258
-- Data for Name: file_action_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5260 (class 0 OID 67466)
-- Dependencies: 256
-- Data for Name: file_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5238 (class 0 OID 41309)
-- Dependencies: 234
-- Data for Name: historique_departs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5236 (class 0 OID 41291)
-- Dependencies: 232
-- Data for Name: historique_recrutement; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5268 (class 0 OID 76031)
-- Dependencies: 264
-- Data for Name: hr_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5266 (class 0 OID 76018)
-- Dependencies: 262
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5288 (class 0 OID 92316)
-- Dependencies: 284
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5248 (class 0 OID 41390)
-- Dependencies: 244
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5250 (class 0 OID 59298)
-- Dependencies: 246
-- Data for Name: offboarding_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5272 (class 0 OID 84131)
-- Dependencies: 268
-- Data for Name: onboarding_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5282 (class 0 OID 84209)
-- Dependencies: 278
-- Data for Name: procedure_commentaires; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5278 (class 0 OID 84170)
-- Dependencies: 274
-- Data for Name: procedure_documents_requis; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5280 (class 0 OID 84187)
-- Dependencies: 276
-- Data for Name: procedure_documents_soumis; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5274 (class 0 OID 84141)
-- Dependencies: 270
-- Data for Name: procedure_dossiers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5276 (class 0 OID 84157)
-- Dependencies: 272
-- Data for Name: procedure_etapes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5284 (class 0 OID 84225)
-- Dependencies: 280
-- Data for Name: procedure_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5286 (class 0 OID 84242)
-- Dependencies: 282
-- Data for Name: procedure_statistiques; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5254 (class 0 OID 59318)
-- Dependencies: 250
-- Data for Name: recrutement_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5258 (class 0 OID 67455)
-- Dependencies: 254
-- Data for Name: request_files; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5244 (class 0 OID 41360)
-- Dependencies: 240
-- Data for Name: sanctions_table; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5270 (class 0 OID 84113)
-- Dependencies: 266
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5240 (class 0 OID 41326)
-- Dependencies: 236
-- Data for Name: visites_medicales; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5328 (class 0 OID 0)
-- Dependencies: 229
-- Name: absence_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.absence_id_seq', 116, true);


--
-- TOC entry 5329 (class 0 OID 0)
-- Dependencies: 227
-- Name: absences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.absences_id_seq', 1, false);


--
-- TOC entry 5330 (class 0 OID 0)
-- Dependencies: 225
-- Name: conges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conges_id_seq', 13, true);


--
-- TOC entry 5331 (class 0 OID 0)
-- Dependencies: 251
-- Name: contrats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contrats_id_seq', 166, true);


--
-- TOC entry 5332 (class 0 OID 0)
-- Dependencies: 247
-- Name: depart_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.depart_history_id_seq', 14, true);


--
-- TOC entry 5333 (class 0 OID 0)
-- Dependencies: 219
-- Name: effectif_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.effectif_id_seq', 15, true);


--
-- TOC entry 5334 (class 0 OID 0)
-- Dependencies: 223
-- Name: employee_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_documents_id_seq', 2, true);


--
-- TOC entry 5335 (class 0 OID 0)
-- Dependencies: 259
-- Name: employee_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_notifications_id_seq', 1, false);


--
-- TOC entry 5336 (class 0 OID 0)
-- Dependencies: 237
-- Name: employee_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_requests_id_seq', 17, true);


--
-- TOC entry 5337 (class 0 OID 0)
-- Dependencies: 221
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 201, true);


--
-- TOC entry 5338 (class 0 OID 0)
-- Dependencies: 241
-- Name: evenements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.evenements_id_seq', 5, true);


--
-- TOC entry 5339 (class 0 OID 0)
-- Dependencies: 257
-- Name: file_action_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.file_action_history_id_seq', 4, true);


--
-- TOC entry 5340 (class 0 OID 0)
-- Dependencies: 255
-- Name: file_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.file_comments_id_seq', 1, false);


--
-- TOC entry 5341 (class 0 OID 0)
-- Dependencies: 233
-- Name: historique_departs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historique_departs_id_seq', 62, true);


--
-- TOC entry 5342 (class 0 OID 0)
-- Dependencies: 231
-- Name: historique_recrutement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historique_recrutement_id_seq', 112, true);


--
-- TOC entry 5343 (class 0 OID 0)
-- Dependencies: 263
-- Name: hr_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hr_tasks_id_seq', 16, true);


--
-- TOC entry 5344 (class 0 OID 0)
-- Dependencies: 261
-- Name: interviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interviews_id_seq', 13, true);


--
-- TOC entry 5345 (class 0 OID 0)
-- Dependencies: 283
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 33, true);


--
-- TOC entry 5346 (class 0 OID 0)
-- Dependencies: 243
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notes_id_seq', 3, true);


--
-- TOC entry 5347 (class 0 OID 0)
-- Dependencies: 245
-- Name: offboarding_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.offboarding_history_id_seq', 13, true);


--
-- TOC entry 5348 (class 0 OID 0)
-- Dependencies: 267
-- Name: onboarding_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.onboarding_history_id_seq', 2, true);


--
-- TOC entry 5349 (class 0 OID 0)
-- Dependencies: 277
-- Name: procedure_commentaires_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.procedure_commentaires_id_seq', 1, true);


--
-- TOC entry 5350 (class 0 OID 0)
-- Dependencies: 273
-- Name: procedure_documents_requis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.procedure_documents_requis_id_seq', 12, true);


--
-- TOC entry 5351 (class 0 OID 0)
-- Dependencies: 275
-- Name: procedure_documents_soumis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.procedure_documents_soumis_id_seq', 1, false);


--
-- TOC entry 5352 (class 0 OID 0)
-- Dependencies: 269
-- Name: procedure_dossiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.procedure_dossiers_id_seq', 7, true);


--
-- TOC entry 5353 (class 0 OID 0)
-- Dependencies: 271
-- Name: procedure_etapes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.procedure_etapes_id_seq', 6, true);


--
-- TOC entry 5354 (class 0 OID 0)
-- Dependencies: 279
-- Name: procedure_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.procedure_notifications_id_seq', 1, true);


--
-- TOC entry 5355 (class 0 OID 0)
-- Dependencies: 281
-- Name: procedure_statistiques_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.procedure_statistiques_id_seq', 1, false);


--
-- TOC entry 5356 (class 0 OID 0)
-- Dependencies: 249
-- Name: recrutement_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recrutement_history_id_seq', 22, true);


--
-- TOC entry 5357 (class 0 OID 0)
-- Dependencies: 253
-- Name: request_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_files_id_seq', 2, true);


--
-- TOC entry 5358 (class 0 OID 0)
-- Dependencies: 239
-- Name: sanctions_table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sanctions_table_id_seq', 3, true);


--
-- TOC entry 5359 (class 0 OID 0)
-- Dependencies: 265
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 8, true);


--
-- TOC entry 5360 (class 0 OID 0)
-- Dependencies: 235
-- Name: visites_medicales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visites_medicales_id_seq', 27, true);


--
-- TOC entry 4962 (class 2606 OID 41285)
-- Name: absence absence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absence
    ADD CONSTRAINT absence_pkey PRIMARY KEY (id);


--
-- TOC entry 4960 (class 2606 OID 41273)
-- Name: absences absences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absences
    ADD CONSTRAINT absences_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 41248)
-- Name: conges conges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conges
    ADD CONSTRAINT conges_pkey PRIMARY KEY (id);


--
-- TOC entry 4997 (class 2606 OID 59338)
-- Name: contrats contrats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats
    ADD CONSTRAINT contrats_pkey PRIMARY KEY (id);


--
-- TOC entry 4993 (class 2606 OID 59316)
-- Name: depart_history depart_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depart_history
    ADD CONSTRAINT depart_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 33047)
-- Name: effectif effectif_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.effectif
    ADD CONSTRAINT effectif_pkey PRIMARY KEY (id);


--
-- TOC entry 4956 (class 2606 OID 41225)
-- Name: employee_documents employee_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT employee_documents_pkey PRIMARY KEY (id);


--
-- TOC entry 5015 (class 2606 OID 67506)
-- Name: employee_notifications employee_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_notifications
    ADD CONSTRAINT employee_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 2606 OID 41354)
-- Name: employee_requests employee_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_requests
    ADD CONSTRAINT employee_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4949 (class 2606 OID 33083)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 4987 (class 2606 OID 41385)
-- Name: evenements evenements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evenements
    ADD CONSTRAINT evenements_pkey PRIMARY KEY (id);


--
-- TOC entry 5010 (class 2606 OID 67485)
-- Name: file_action_history file_action_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_action_history
    ADD CONSTRAINT file_action_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5005 (class 2606 OID 67475)
-- Name: file_comments file_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_comments
    ADD CONSTRAINT file_comments_pkey PRIMARY KEY (id);


--
-- TOC entry 4970 (class 2606 OID 41318)
-- Name: historique_departs historique_departs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_departs
    ADD CONSTRAINT historique_departs_pkey PRIMARY KEY (id);


--
-- TOC entry 4964 (class 2606 OID 41301)
-- Name: historique_recrutement historique_recrutement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_recrutement
    ADD CONSTRAINT historique_recrutement_pkey PRIMARY KEY (id);


--
-- TOC entry 5022 (class 2606 OID 76043)
-- Name: hr_tasks hr_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hr_tasks
    ADD CONSTRAINT hr_tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 5020 (class 2606 OID 76029)
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- TOC entry 5060 (class 2606 OID 92328)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4989 (class 2606 OID 41401)
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- TOC entry 4991 (class 2606 OID 59306)
-- Name: offboarding_history offboarding_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offboarding_history
    ADD CONSTRAINT offboarding_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5030 (class 2606 OID 84139)
-- Name: onboarding_history onboarding_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_history
    ADD CONSTRAINT onboarding_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5049 (class 2606 OID 84218)
-- Name: procedure_commentaires procedure_commentaires_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_commentaires
    ADD CONSTRAINT procedure_commentaires_pkey PRIMARY KEY (id);


--
-- TOC entry 5043 (class 2606 OID 84180)
-- Name: procedure_documents_requis procedure_documents_requis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_documents_requis
    ADD CONSTRAINT procedure_documents_requis_pkey PRIMARY KEY (id);


--
-- TOC entry 5046 (class 2606 OID 84197)
-- Name: procedure_documents_soumis procedure_documents_soumis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_documents_soumis
    ADD CONSTRAINT procedure_documents_soumis_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 84155)
-- Name: procedure_dossiers procedure_dossiers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_dossiers
    ADD CONSTRAINT procedure_dossiers_email_key UNIQUE (email);


--
-- TOC entry 5037 (class 2606 OID 84153)
-- Name: procedure_dossiers procedure_dossiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_dossiers
    ADD CONSTRAINT procedure_dossiers_pkey PRIMARY KEY (id);


--
-- TOC entry 5039 (class 2606 OID 84168)
-- Name: procedure_etapes procedure_etapes_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_etapes
    ADD CONSTRAINT procedure_etapes_nom_key UNIQUE (nom);


--
-- TOC entry 5041 (class 2606 OID 84166)
-- Name: procedure_etapes procedure_etapes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_etapes
    ADD CONSTRAINT procedure_etapes_pkey PRIMARY KEY (id);


--
-- TOC entry 5052 (class 2606 OID 84235)
-- Name: procedure_notifications procedure_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_notifications
    ADD CONSTRAINT procedure_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5054 (class 2606 OID 84253)
-- Name: procedure_statistiques procedure_statistiques_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_statistiques
    ADD CONSTRAINT procedure_statistiques_pkey PRIMARY KEY (id);


--
-- TOC entry 4995 (class 2606 OID 59328)
-- Name: recrutement_history recrutement_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recrutement_history
    ADD CONSTRAINT recrutement_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5003 (class 2606 OID 67464)
-- Name: request_files request_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_files
    ADD CONSTRAINT request_files_pkey PRIMARY KEY (id);


--
-- TOC entry 4985 (class 2606 OID 41370)
-- Name: sanctions_table sanctions_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sanctions_table
    ADD CONSTRAINT sanctions_table_pkey PRIMARY KEY (id);


--
-- TOC entry 5028 (class 2606 OID 84125)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 4976 (class 2606 OID 41336)
-- Name: visites_medicales visites_medicales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visites_medicales
    ADD CONSTRAINT visites_medicales_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 1259 OID 41320)
-- Name: idx_date_depart; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_date_depart ON public.historique_departs USING btree (date_depart);


--
-- TOC entry 4965 (class 1259 OID 41303)
-- Name: idx_date_recrutement; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_date_recrutement ON public.historique_recrutement USING btree (date_recrutement);


--
-- TOC entry 4966 (class 1259 OID 41304)
-- Name: idx_departement; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_departement ON public.historique_recrutement USING btree (departement);


--
-- TOC entry 4972 (class 1259 OID 41321)
-- Name: idx_departement_depart; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_departement_depart ON public.historique_departs USING btree (departement);


--
-- TOC entry 4947 (class 1259 OID 33091)
-- Name: idx_effectif_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_effectif_email ON public.effectif USING btree (email);


--
-- TOC entry 5016 (class 1259 OID 67514)
-- Name: idx_employee_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employee_notifications_created_at ON public.employee_notifications USING btree (created_at);


--
-- TOC entry 5017 (class 1259 OID 67512)
-- Name: idx_employee_notifications_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employee_notifications_employee_id ON public.employee_notifications USING btree (employee_id);


--
-- TOC entry 5018 (class 1259 OID 67513)
-- Name: idx_employee_notifications_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employee_notifications_type ON public.employee_notifications USING btree (type);


--
-- TOC entry 4979 (class 1259 OID 41355)
-- Name: idx_employee_requests_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employee_requests_employee_id ON public.employee_requests USING btree (employee_id);


--
-- TOC entry 4980 (class 1259 OID 41356)
-- Name: idx_employee_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employee_requests_status ON public.employee_requests USING btree (status);


--
-- TOC entry 4981 (class 1259 OID 41357)
-- Name: idx_employee_requests_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employee_requests_type ON public.employee_requests USING btree (request_type);


--
-- TOC entry 4950 (class 1259 OID 33088)
-- Name: idx_employees_date_fin_contrat; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_date_fin_contrat ON public.employees USING btree (date_fin_contrat);


--
-- TOC entry 4951 (class 1259 OID 33089)
-- Name: idx_employees_functional_area; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_functional_area ON public.employees USING btree (functional_area);


--
-- TOC entry 4952 (class 1259 OID 92335)
-- Name: idx_employees_photo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_photo ON public.employees USING btree (photo_path);


--
-- TOC entry 4953 (class 1259 OID 33090)
-- Name: idx_employees_statut_employe; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_statut_employe ON public.employees USING btree (statut_employe);


--
-- TOC entry 4954 (class 1259 OID 33087)
-- Name: idx_employees_type_contrat; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_type_contrat ON public.employees USING btree (type_contrat);


--
-- TOC entry 5011 (class 1259 OID 67495)
-- Name: idx_file_action_history_action_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_file_action_history_action_date ON public.file_action_history USING btree (action_date);


--
-- TOC entry 5012 (class 1259 OID 67494)
-- Name: idx_file_action_history_action_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_file_action_history_action_type ON public.file_action_history USING btree (action_type);


--
-- TOC entry 5013 (class 1259 OID 67493)
-- Name: idx_file_action_history_file_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_file_action_history_file_id ON public.file_action_history USING btree (file_id);


--
-- TOC entry 5006 (class 1259 OID 67492)
-- Name: idx_file_comments_comment_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_file_comments_comment_date ON public.file_comments USING btree (comment_date);


--
-- TOC entry 5007 (class 1259 OID 67491)
-- Name: idx_file_comments_commenter_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_file_comments_commenter_id ON public.file_comments USING btree (commenter_id);


--
-- TOC entry 5008 (class 1259 OID 67490)
-- Name: idx_file_comments_file_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_file_comments_file_id ON public.file_comments USING btree (file_id);


--
-- TOC entry 5055 (class 1259 OID 92332)
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (sender_id, receiver_id, "timestamp");


--
-- TOC entry 5056 (class 1259 OID 92330)
-- Name: idx_messages_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_receiver ON public.messages USING btree (receiver_id, receiver_type);


--
-- TOC entry 5057 (class 1259 OID 92329)
-- Name: idx_messages_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id, sender_type);


--
-- TOC entry 5058 (class 1259 OID 92331)
-- Name: idx_messages_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_timestamp ON public.messages USING btree ("timestamp" DESC);


--
-- TOC entry 4973 (class 1259 OID 41322)
-- Name: idx_motif_depart; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_motif_depart ON public.historique_departs USING btree (motif_depart);


--
-- TOC entry 4967 (class 1259 OID 41302)
-- Name: idx_nom_prenom; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nom_prenom ON public.historique_recrutement USING btree (nom, prenom);


--
-- TOC entry 4974 (class 1259 OID 41319)
-- Name: idx_nom_prenom_depart; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nom_prenom_depart ON public.historique_departs USING btree (nom, prenom);


--
-- TOC entry 5047 (class 1259 OID 84258)
-- Name: idx_procedure_commentaires_dossier_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_procedure_commentaires_dossier_id ON public.procedure_commentaires USING btree (dossier_id);


--
-- TOC entry 5044 (class 1259 OID 84257)
-- Name: idx_procedure_documents_soumis_dossier_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_procedure_documents_soumis_dossier_id ON public.procedure_documents_soumis USING btree (dossier_id);


--
-- TOC entry 5031 (class 1259 OID 84256)
-- Name: idx_procedure_dossiers_date_creation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_procedure_dossiers_date_creation ON public.procedure_dossiers USING btree (date_creation);


--
-- TOC entry 5032 (class 1259 OID 84254)
-- Name: idx_procedure_dossiers_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_procedure_dossiers_email ON public.procedure_dossiers USING btree (email);


--
-- TOC entry 5033 (class 1259 OID 84255)
-- Name: idx_procedure_dossiers_statut; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_procedure_dossiers_statut ON public.procedure_dossiers USING btree (statut);


--
-- TOC entry 5050 (class 1259 OID 84259)
-- Name: idx_procedure_notifications_dossier_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_procedure_notifications_dossier_id ON public.procedure_notifications USING btree (dossier_id);


--
-- TOC entry 4998 (class 1259 OID 67489)
-- Name: idx_request_files_is_approved; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_request_files_is_approved ON public.request_files USING btree (is_approved);


--
-- TOC entry 4999 (class 1259 OID 67486)
-- Name: idx_request_files_request_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_request_files_request_id ON public.request_files USING btree (request_id);


--
-- TOC entry 5000 (class 1259 OID 67488)
-- Name: idx_request_files_upload_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_request_files_upload_date ON public.request_files USING btree (upload_date);


--
-- TOC entry 5001 (class 1259 OID 67487)
-- Name: idx_request_files_uploaded_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_request_files_uploaded_by ON public.request_files USING btree (uploaded_by);


--
-- TOC entry 4982 (class 1259 OID 41372)
-- Name: idx_sanctions_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sanctions_date ON public.sanctions_table USING btree (date);


--
-- TOC entry 4983 (class 1259 OID 41371)
-- Name: idx_sanctions_nom_employe; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sanctions_nom_employe ON public.sanctions_table USING btree (nom_employe);


--
-- TOC entry 5023 (class 1259 OID 84127)
-- Name: idx_tasks_assignee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_assignee ON public.tasks USING btree (assignee);


--
-- TOC entry 5024 (class 1259 OID 84129)
-- Name: idx_tasks_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_category ON public.tasks USING btree (category);


--
-- TOC entry 5025 (class 1259 OID 84128)
-- Name: idx_tasks_due_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_due_date ON public.tasks USING btree (due_date);


--
-- TOC entry 5026 (class 1259 OID 84126)
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);


--
-- TOC entry 4968 (class 1259 OID 41305)
-- Name: idx_type_contrat; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_type_contrat ON public.historique_recrutement USING btree (type_contrat);


--
-- TOC entry 5070 (class 2620 OID 41289)
-- Name: absence update_absence_date_modification; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_absence_date_modification BEFORE UPDATE ON public.absence FOR EACH ROW EXECUTE FUNCTION public.update_date_modification_column();


--
-- TOC entry 5071 (class 2620 OID 41287)
-- Name: absence update_absence_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_absence_updated_at BEFORE UPDATE ON public.absence FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5076 (class 2620 OID 41387)
-- Name: evenements update_evenement_modtime; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_evenement_modtime BEFORE UPDATE ON public.evenements FOR EACH ROW EXECUTE FUNCTION public.update_evenement_modtime();


--
-- TOC entry 5073 (class 2620 OID 41324)
-- Name: historique_departs update_historique_departs_modtime; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_historique_departs_modtime BEFORE UPDATE ON public.historique_departs FOR EACH ROW EXECUTE FUNCTION public.update_historique_departs_modtime();


--
-- TOC entry 5072 (class 2620 OID 41307)
-- Name: historique_recrutement update_historique_recrutement_date_modification; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_historique_recrutement_date_modification BEFORE UPDATE ON public.historique_recrutement FOR EACH ROW EXECUTE FUNCTION public.update_date_modification();


--
-- TOC entry 5077 (class 2620 OID 92334)
-- Name: messages update_messages_modtime; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_messages_modtime BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_messages_updated_at();


--
-- TOC entry 5075 (class 2620 OID 41374)
-- Name: sanctions_table update_sanctions_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_sanctions_timestamp BEFORE UPDATE ON public.sanctions_table FOR EACH ROW EXECUTE FUNCTION public.update_sanctions_updated_at();


--
-- TOC entry 5074 (class 2620 OID 41338)
-- Name: visites_medicales update_visites_medicales_date_modification; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_visites_medicales_date_modification BEFORE UPDATE ON public.visites_medicales FOR EACH ROW EXECUTE FUNCTION public.update_visites_date_modification_column();


--
-- TOC entry 5061 (class 2606 OID 41226)
-- Name: employee_documents employee_documents_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT employee_documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5064 (class 2606 OID 67507)
-- Name: employee_notifications employee_notifications_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_notifications
    ADD CONSTRAINT employee_notifications_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5063 (class 2606 OID 76010)
-- Name: contrats fk_contrats_employee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats
    ADD CONSTRAINT fk_contrats_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5062 (class 2606 OID 41231)
-- Name: employee_documents fk_employee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- TOC entry 5068 (class 2606 OID 84219)
-- Name: procedure_commentaires procedure_commentaires_dossier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_commentaires
    ADD CONSTRAINT procedure_commentaires_dossier_id_fkey FOREIGN KEY (dossier_id) REFERENCES public.procedure_dossiers(id) ON DELETE CASCADE;


--
-- TOC entry 5065 (class 2606 OID 84181)
-- Name: procedure_documents_requis procedure_documents_requis_etape_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_documents_requis
    ADD CONSTRAINT procedure_documents_requis_etape_id_fkey FOREIGN KEY (etape_id) REFERENCES public.procedure_etapes(id) ON DELETE CASCADE;


--
-- TOC entry 5066 (class 2606 OID 84203)
-- Name: procedure_documents_soumis procedure_documents_soumis_document_requis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_documents_soumis
    ADD CONSTRAINT procedure_documents_soumis_document_requis_id_fkey FOREIGN KEY (document_requis_id) REFERENCES public.procedure_documents_requis(id);


--
-- TOC entry 5067 (class 2606 OID 84198)
-- Name: procedure_documents_soumis procedure_documents_soumis_dossier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_documents_soumis
    ADD CONSTRAINT procedure_documents_soumis_dossier_id_fkey FOREIGN KEY (dossier_id) REFERENCES public.procedure_dossiers(id) ON DELETE CASCADE;


--
-- TOC entry 5069 (class 2606 OID 84236)
-- Name: procedure_notifications procedure_notifications_dossier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procedure_notifications
    ADD CONSTRAINT procedure_notifications_dossier_id_fkey FOREIGN KEY (dossier_id) REFERENCES public.procedure_dossiers(id) ON DELETE CASCADE;


-- Completed on 2025-10-27 10:48:07

--
-- PostgreSQL database dump complete
--

