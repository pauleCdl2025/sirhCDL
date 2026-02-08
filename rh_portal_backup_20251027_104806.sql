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

COPY public.absence (id, nom_employe, service, poste, type_absence, motif, date_debut, date_fin, statut, date_traitement, document_path, date_creation, updated_at, date_retour, remuneration, date_modification) FROM stdin;
2	ONDO NDONG Gontrant	Accueil/Facturation	Agent d'accueil et facturation	Absence	C‚r‚monie religieuse	2024-07-26	2024-07-27	Approuvé	2025-07-19 14:58:37.912109	\N	2025-04-19 10:09:32	2025-07-19 14:58:37.912109	\N	\N	2025-07-19 14:58:37.912109
3	MATSAGA M‚lissa	Laboratoire	Technicienne laboratoire	Arrˆt maladie	Repos maladie	2024-07-29	2024-07-31	Approuvé	2025-07-19 15:00:11.369059	\N	2025-04-19 10:09:32	2025-07-19 15:00:11.369059	\N	\N	2025-07-19 15:00:11.369059
4	UZODIMMA Chioma	Clinique	Secr‚taire medicale	Arrˆt maladie	Repos maladie	2024-07-30	2024-08-03	Approuvé	2025-07-19 15:01:00.178135	\N	2025-04-19 10:09:32	2025-07-19 15:01:00.178135	\N	\N	2025-07-19 15:01:00.178135
5	BAYACKABOMA Petula	Clinique	InfirmiŠre	Absence	D‚cŠs de la mŠre	2024-08-02	2024-08-05	Approuvé	2025-07-19 15:02:00.441892	\N	2025-04-19 10:09:32	2025-07-19 15:02:00.441892	\N	\N	2025-07-19 15:02:00.441892
47	SALOM RODRIGUEZ Yanet	Clinique	Medecin g‚n‚raliste	Absence	Raison personnelle	2024-11-18	2024-11-29	Approuvé	2025-07-19 15:03:03.47405	\N	2025-04-19 10:09:32	2025-07-19 15:03:03.47405	\N	\N	2025-07-19 15:03:03.47405
6	EMVO BARRO Lanslow	Accueil/Facturation	Agent d'accueil et facturation	Absence	Obligation familiale	2024-08-09	2024-08-09	Approuvé	2025-07-19 15:03:12.29049	\N	2025-04-19 10:09:32	2025-07-19 15:03:12.29049	\N	\N	2025-07-19 15:03:12.29049
7	OFOU NFOULOU ChimŠne	Clinique	Technicienne de surface	Arrˆt maladie	Repos maladie	2024-08-18	2024-08-20	Approuvé	2025-07-19 15:04:11.394015	\N	2025-04-19 10:09:32	2025-07-19 15:04:11.394015	\N	\N	2025-07-19 15:04:11.394015
48	MBA MEZUI Edouard	Buanderie	Agent d'entretien	Absence	C‚r‚monie religieuse	2024-11-02	2024-11-03	Approuvé	2025-07-21 13:18:04.68045	\N	2025-04-19 10:09:32	2025-07-21 13:18:04.68045	\N	\N	2025-07-21 13:18:04.68045
46	BOURAIMA Aridath	Clinique	Medecin g‚n‚raliste	Absence	Formalit‚ administrative	2024-10-31	2024-10-31	Approuvé	2025-08-05 07:55:57.485158	\N	2025-04-19 10:09:32	2025-08-05 07:55:57.485158	\N	\N	2025-08-05 07:55:57.485158
44	MATSANGA FATOMBI Waridath	Clinique	InfirmiŠre	Arrˆt maladie	Repos maladie	2024-10-29	2024-10-31	Approuvé	2025-08-05 07:56:04.449765	\N	2025-04-19 10:09:32	2025-08-05 07:56:04.449765	\N	\N	2025-08-05 07:56:04.449765
45	NGUEMBIT NGUEMBIT Mayit‚	Clinique	InfirmiŠre	Arrˆt maladie	Repos maladie	2024-10-29	2024-11-03	Approuvé	2025-08-05 07:56:13.585533	\N	2025-04-19 10:09:32	2025-08-05 07:56:13.585533	\N	\N	2025-08-05 07:56:13.585533
42	NZE ONDO Christelle	Buanderie	Technicienne de surface	Absence	D‚cŠs	2024-10-28	2024-10-06	Approuvé	2025-08-05 07:56:21.94658	\N	2025-04-19 10:09:32	2025-08-05 07:56:21.94658	\N	\N	2025-08-05 07:56:21.94658
43	KUMILUDE Ruphanie	Accueil/Facturation	Agent d'accueil et facturation	Absence	Affection m‚dicale	2024-10-28	2024-10-28	Approuvé	2025-08-05 07:56:28.183381	\N	2025-04-19 10:09:32	2025-08-05 07:56:28.183381	\N	\N	2025-08-05 07:56:28.183381
39	NGOLO MAYOMBO L‚nie	Walyah	EquipiŠre polyvalente	Absence	raison acad‚mique	2024-10-26	2024-10-26	Approuvé	2025-08-05 07:56:35.770774	\N	2025-04-19 10:09:32	2025-08-05 07:56:35.770774	\N	\N	2025-08-05 07:56:35.770774
40	BATCHY NDOSSY Solenne Ophely	walyah	cuisiniŠre	Absence	D‚cŠs de la cousine	2024-10-25	2024-10-26	Approuvé	2025-08-05 07:56:42.63467	\N	2025-04-19 10:09:32	2025-08-05 07:56:42.63467	\N	\N	2025-08-05 07:56:42.63467
41	MUSSYALY MPAMAH Cindy	clinique	infirmiŠre	Arrˆt maladie	Repos maladie	2024-10-24	2024-10-26	Approuvé	2025-08-05 07:57:30.818092	\N	2025-04-19 10:09:32	2025-08-05 07:57:30.818092	\N	\N	2025-08-05 07:57:30.818092
35	MATOUNGOU KOMBA Blandine	Laboratoire	Technicienne sup de labo	Absence	Affection m‚dicale	2024-10-22	2024-10-22	Approuvé	2025-08-05 07:57:46.295172	\N	2025-04-19 10:09:32	2025-08-05 07:57:46.295172	\N	\N	2025-08-05 07:57:46.295172
36	NGUEMBIT NGUEMBIT Mayit‚	Clinique	InfirmiŠre assistante	Arrˆt maladie	Repos maladie	2024-10-22	2024-10-28	Approuvé	2025-08-05 07:57:53.201822	\N	2025-04-19 10:09:32	2025-08-05 07:57:53.201822	\N	\N	2025-08-05 07:57:53.201822
37	OHAMBE OMOYE Marie-Carole	Clinique	InfirmiŠre	Arrˆt maladie	Repos maladie	2024-10-22	2024-10-25	Approuvé	2025-08-05 07:58:01.198424	\N	2025-04-19 10:09:32	2025-08-05 07:58:01.198424	\N	\N	2025-08-05 07:58:01.198424
38	KOMBA MAYOMBO Vivaldie	Accueil/Facturation	Agent d'accueil et facturation	Arrˆt maladie	Affection m‚dicale	2024-10-21	2024-10-23	Approuvé	2025-08-05 07:58:09.025572	\N	2025-04-19 10:09:32	2025-08-05 07:58:09.025572	\N	\N	2025-08-05 07:58:09.025572
32	MINKUE MI NDONG Manouchera Lexia	Accueil/Facturation	Agent d'accueil et facturation	Arrˆt maladie	Repos maladie	2024-10-18	2024-10-21	Approuvé	2025-08-05 07:58:20.231072	\N	2025-04-19 10:09:32	2025-08-05 07:58:20.231072	\N	\N	2025-08-05 07:58:20.231072
28	ADA ACKWE Myriame	comptabilit‚	Assistante comptable	Absence	Formalit‚ administrative	2024-10-15	2024-10-15	Approuvé	2025-08-05 07:58:26.286895	\N	2025-04-19 10:09:32	2025-08-05 07:58:26.286895	\N	\N	2025-08-05 07:58:26.286895
29	DOGOUI Epse MBOUMBA Herv‚ B.	Cotation	Agent saisie et cotation	Absence	Formalit‚ administrative	2024-10-15	2024-10-15	Approuvé	2025-08-05 07:58:32.994584	\N	2025-04-19 10:09:32	2025-08-05 07:58:32.994584	\N	\N	2025-08-05 07:58:32.994584
8	MERE OKOWA Isabelle	RH	Responsable Capital humain	Arrˆt maladie	Repos maladie	2024-08-28	2024-08-29	Approuvé	2025-08-05 07:58:40.318506	\N	2025-04-19 10:09:32	2025-08-05 07:58:40.318506	\N	\N	2025-08-05 07:58:40.318506
30	OBONE MBA Ursula	clinique	Stagiaire en imagerie	Absence	raison acad‚mique	2024-10-15	2024-10-15	Approuvé	2025-08-05 07:58:47.258145	\N	2025-04-19 10:09:32	2025-08-05 07:58:47.258145	\N	\N	2025-08-05 07:58:47.258145
31	MATAMBA NDEMBET F‚lie R.	Clinique	Secr‚taire medicale	Arrˆt maladie	Affection m‚dicale	2024-10-15	2024-10-18	Approuvé	2025-08-05 07:58:54.623151	\N	2025-04-19 10:09:32	2025-08-05 07:58:54.623151	\N	\N	2025-08-05 07:58:54.623151
25	OBAME AKOUE Emmanuel Fortune	Cuisine	cuisinier	Arrˆt maladie	Repos maladie	2024-10-09	2024-10-12	Approuvé	2025-08-05 07:59:10.478933	\N	2025-04-19 10:09:32	2025-08-05 07:59:10.478933	\N	\N	2025-08-05 07:59:10.478933
26	DOMINGO NadŠge	laboratoire	Responsable laboratoire	Arrˆt maladie	Repos maladie	2024-10-09	2024-10-11	Approuvé	2025-08-05 07:59:18.441985	\N	2025-04-19 10:09:32	2025-08-05 07:59:18.441985	\N	\N	2025-08-05 07:59:18.441985
24	NIYINGONBE BEKALE Linsay	Accueil/Facturation	Agent d'accueil et facturation	Arrˆt maladie	Repos maladie	2024-10-08	2024-10-10	Approuvé	2025-08-05 07:59:27.031	\N	2025-04-19 10:09:32	2025-08-05 07:59:27.031	\N	\N	2025-08-05 07:59:27.031
23	NDONG NGUEMA Kelly	Clinique	secr‚taire medicale	Absence	Formalit‚ administrative	2024-10-04	2024-10-04	Approuvé	2025-08-05 07:59:35.606232	\N	2025-04-19 10:09:32	2025-08-05 07:59:35.606232	\N	\N	2025-08-05 07:59:35.606232
22	PANGA ChimŠne	clinique	infirmiŠre	Arrˆt maladie	r‚cup‚ration aprŠs hospitalisation	2024-10-03	2024-10-08	Approuvé	2025-08-05 07:59:43.081168	\N	2025-04-19 10:09:32	2025-08-05 07:59:43.081168	\N	\N	2025-08-05 07:59:43.081168
21	KUMILUDE Ruphanie	Accueil/Facturation	Agent d'accueil et facturation	Absence	C‚r‚monie religieuse	2024-10-02	2024-10-02	Approuvé	2025-08-05 07:59:50.158647	\N	2025-04-19 10:09:32	2025-08-05 07:59:50.158647	\N	\N	2025-08-05 07:59:50.158647
19	NDIMANGOYE AMBOGO Marie R	Clinique	Technicienne sup de labo	Arrˆt maladie	Repos maladie	2024-09-30	2024-10-04	Approuvé	2025-08-05 07:59:56.834438	\N	2025-04-19 10:09:32	2025-08-05 07:59:56.834438	\N	\N	2025-08-05 07:59:56.834438
20	NZAMBA TSOMAKEKA Esther E.	Laboratoire	Technicienne laboratoire	Absence	Obligation familiale	2024-09-30	2024-09-30	Approuvé	2025-08-05 08:00:03.396273	\N	2025-04-19 10:09:32	2025-08-05 08:00:03.396273	\N	\N	2025-08-05 08:00:03.396273
10	SALOM RODRIGUEZ Yanet	Clinique	Medecin g‚n‚raliste	Absence	Raison personnelle	2024-09-02	2024-09-06	Approuvé	2025-08-05 08:00:19.218676	\N	2025-04-19 10:09:32	2025-08-05 08:00:19.218676	\N	\N	2025-08-05 08:00:19.218676
17	NGOLO MAYOMBO L‚nie	Walyah	EquipiŠre polyvalente	Absence	Formalit‚ administrative	2024-09-26	2024-09-26	Approuvé	2025-08-05 08:00:34.438423	\N	2025-04-19 10:09:32	2025-08-05 08:00:34.438423	\N	\N	2025-08-05 08:00:34.438423
16	MATSANGA FATOMBI Waridath	clinique	InfirmiŠre	Arrˆt maladie	Repos maladie	2024-09-24	2024-09-30	Approuvé	2025-08-05 08:00:41.898379	\N	2025-04-19 10:09:32	2025-08-05 08:00:41.898379	\N	\N	2025-08-05 08:00:41.898379
15	DEKPE Robert	Clinique	Infirmier	Arrˆt maladie	Repos maladie	2024-09-23	2024-09-25	Approuvé	2025-08-05 08:00:49.583022	\N	2025-04-19 10:09:32	2025-08-05 08:00:49.583022	\N	\N	2025-08-05 08:00:49.583022
14	MANSIR ELLA Michelle	clinique	Medecin g‚n‚raliste	Arrˆt maladie	Repos maladie	2024-09-20	2024-09-23	Approuvé	2025-08-05 08:00:57.409395	\N	2025-04-19 10:09:32	2025-08-05 08:00:57.409395	\N	\N	2025-08-05 08:00:57.409395
13	MATAMBA NDEMBET F‚lie R.	Clinique	Secr‚taire medicale	Absence	Affection m‚dicale	2024-09-13	2024-09-13	Approuvé	2025-08-05 08:01:06.109418	\N	2025-04-19 10:09:32	2025-08-05 08:01:06.109418	\N	\N	2025-08-05 08:01:06.109418
12	EKOUME EYEGHE EMMA	Accueil/Facturation	Agent d'accueil et facturation	Absence	raison acad‚mique	2024-09-06	2024-09-06	Approuvé	2025-08-05 08:01:13.409522	\N	2025-04-19 10:09:32	2025-08-05 08:01:13.409522	\N	\N	2025-08-05 08:01:13.409522
11	IROUNDA K Nellya D.	Marketing/Communication	Community manager	Absence	Formalit‚ administrative	2024-09-03	2024-09-03	Approuvé	2025-08-05 08:01:21.294263	\N	2025-04-19 10:09:32	2025-08-05 08:01:21.294263	\N	\N	2025-08-05 08:01:21.294263
93	MATOUNGOU KOMBA Blandine	Laboratoire	TSBM	Absence	Obligation familiale	2025-03-20	2025-03-20	Approuvé	2025-07-19 14:57:42.837166	\N	2025-04-19 10:09:32	2025-07-19 14:57:42.837166	\N	\N	2025-07-19 14:57:42.837166
94	MATSANGA FATOMBI Waridath	Clinique	InfirmiŠre	Arrˆt maladie	Repos maladie	2025-03-19	2025-03-20	Approuvé	2025-07-19 14:57:54.073985	\N	2025-04-19 10:09:32	2025-07-19 14:57:54.073985	\N	\N	2025-07-19 14:57:54.073985
91	KAYI Cl‚dys Flore	Bureau des entr‚es	Agent call center	Arrˆt maladie	Repos maladie	2025-03-17	2025-03-19	Approuvé	2025-07-19 14:58:11.073976	\N	2025-04-19 10:09:32	2025-07-19 14:58:11.073976	\N	\N	2025-07-19 14:58:11.073976
92	KENGUE DJIGHA Syldany	clinique	InfirmiŠre	Arrˆt maladie	Repos maladie	2025-03-17	2025-03-18	Approuvé	2025-07-19 14:58:15.825873	\N	2025-04-19 10:09:32	2025-07-19 14:58:15.825873	\N	\N	2025-07-19 14:58:15.825873
90	GONDJOUT Fran Christina	cotation	Stagiaire saisie et cotation	Absence	Raison maladie	2025-03-12	2025-03-12	Approuvé	2025-07-19 14:58:20.434077	\N	2025-04-19 10:09:32	2025-07-19 14:58:20.434077	\N	\N	2025-07-19 14:58:20.434077
87	ONDO NDONG Gontrant	cotation	Agent de cotation	Absence	D‚cŠs du grand-pŠre	2025-03-10	2025-03-12	Approuvé	2025-07-19 14:58:24.634082	\N	2025-04-19 10:09:32	2025-07-19 14:58:24.634082	\N	\N	2025-07-19 14:58:24.634082
89	VENGA ENGO Nancy	clinique	InfirmiŠre	Arrˆt maladie	Repos maladie	2025-03-10	2025-03-13	Approuvé	2025-07-19 14:58:29.561584	\N	2025-04-19 10:09:32	2025-07-19 14:58:29.561584	\N	\N	2025-07-19 14:58:29.561584
86	KALUNGA BUBU BOY Charlotte	Direction g‚n‚rale	Agent accueil/ administratif	Absence	Raison familiale	2025-03-05	2025-03-05	Approuvé	2025-07-19 14:58:50.555951	\N	2025-04-19 10:09:32	2025-07-19 14:58:50.555951	\N	\N	2025-07-19 14:58:50.555951
88	SAMBAT Frantz Sebastien	Marketing/Communication	Responsable Marketing/ com	Arrˆt maladie	Repos maladie	2025-03-03	2025-03-09	Approuvé	2025-07-19 14:58:56.425159	\N	2025-04-19 10:09:32	2025-07-19 14:58:56.425159	\N	\N	2025-07-19 14:58:56.425159
84	MENGUE NZE Oriole Sonia	Clinique	Stagiaire imagerie m‚dicale	Arrˆt maladie	Repos maladie	2025-03-01	2025-03-05	Approuvé	2025-07-19 14:59:40.658189	\N	2025-04-19 10:09:32	2025-07-19 14:59:40.658189	\N	\N	2025-07-19 14:59:40.658189
83	LEYEME DINE Patience	clinique	medecin g‚n‚raliste	Arrˆt maladie	Repos maladie	2025-02-17	2025-02-26	Approuvé	2025-07-19 14:59:50.952775	\N	2025-04-19 10:09:32	2025-07-19 14:59:50.952775	\N	\N	2025-07-19 14:59:50.952775
81	NYINDONG NZE Winona Oc‚ane	Walyah	EquipiŠre polyvalente	Arrˆt maladie	Repos maladie	2025-01-28	2025-01-31	Approuvé	2025-07-19 14:59:56.682333	\N	2025-04-19 10:09:32	2025-07-19 14:59:56.682333	\N	\N	2025-07-19 14:59:56.682333
82	MBOUMBA RITA JOY	Marketing/Communication	Responsable communication	Arrˆt maladie	Repos maladie	2025-01-28	2025-02-04	Approuvé	2025-07-19 15:00:02.657858	\N	2025-04-19 10:09:32	2025-07-19 15:00:02.657858	\N	\N	2025-07-19 15:00:02.657858
73	ZOUGOU TOVIGNON Alice	Buanderie	responsable accueil	Absence	Obligation familiale	2025-01-27	2025-02-07	Approuvé	2025-07-19 15:00:16.553494	\N	2025-04-19 10:09:32	2025-07-19 15:00:16.553494	\N	\N	2025-07-19 15:00:16.553494
80	KALUNGA BUBU BOY Charlotte	Accueil/Facturation	Agent d'accueil et Administratif	Arrˆt maladie	Repos maladie	2025-01-22	2025-01-25	Approuvé	2025-07-19 15:00:21.601993	\N	2025-04-19 10:09:32	2025-07-19 15:00:21.601993	\N	\N	2025-07-19 15:00:21.601993
78	DOUTSONA MFOUMBI Loraine Evy	Accueil/Facturation	Agent d'accueil et facturation	Arrˆt maladie	Repos maladie	2025-01-10	2025-01-14	Approuvé	2025-07-19 15:00:26.498215	\N	2025-04-19 10:09:32	2025-07-19 15:00:26.498215	\N	\N	2025-07-19 15:00:26.498215
79	NDIMANGOYE AMBOGO Marie Reine	laboratoire	Technicienne laboratoire	Absence	Obligation familiale	2025-01-10	2025-01-10	Approuvé	2025-07-19 15:00:32.76229	\N	2025-04-19 10:09:32	2025-07-19 15:00:32.76229	\N	\N	2025-07-19 15:00:32.76229
77	ONGOUTA MAFIA Grace	clinique	medecin g‚n‚raliste	Absence	raison acad‚mique	2025-01-06	2025-01-24	Approuvé	2025-07-19 15:00:38.268693	\N	2025-04-19 10:09:32	2025-07-19 15:00:38.268693	\N	\N	2025-07-19 15:00:38.268693
70	NZANG OVONO Catrina	accueil/Facturation	Agent d'accueil et facturation	Absence	Obligation familiale	2025-01-02	2025-01-04	Approuvé	2025-07-19 15:00:52.346581	\N	2025-04-19 10:09:32	2025-07-19 15:00:52.346581	\N	\N	2025-07-19 15:00:52.346581
74	NYANGUI PERRINE	accueil/Facturation	agent d'accueil et facturation	Absence	D‚m‚nagement	2025-01-02	2025-01-02	Approuvé	2025-07-19 15:01:05.937376	\N	2025-04-19 10:09:32	2025-07-19 15:01:05.937376	\N	\N	2025-07-19 15:01:05.937376
75	BOUDENGO BAVEKOUMBOU Livia	RH	Assistante rh	Arrˆt maladie	Repos maladie	2024-12-30	2025-01-01	Approuvé	2025-07-19 15:01:11.34598	\N	2025-04-19 10:09:32	2025-07-19 15:01:11.34598	\N	\N	2025-07-19 15:01:11.34598
71	EMANE NGUIE Gw‚naelle Sthessy	rh	Stagiaire rh	Absence	C‚r‚monie religieuse	2024-12-27	2024-12-27	Approuvé	2025-07-19 15:01:19.009914	\N	2025-04-19 10:09:32	2025-07-19 15:01:19.009914	\N	\N	2025-07-19 15:01:19.009914
72	SALOM RODRIGUEZ Yanet	Clinique	medecin g‚n‚raliste	Absence	Raison personnelle	2024-12-27	2025-12-03	Approuvé	2025-07-19 15:01:24.709471	\N	2025-04-19 10:09:32	2025-07-19 15:01:24.709471	\N	\N	2025-07-19 15:01:24.709471
67	ANGONE EDOU Vasta	walyah	equipiŠre polyvalente	Absence	d‚cŠs	2024-12-23	2024-12-23	Approuvé	2025-07-19 15:01:30.378335	\N	2025-04-19 10:09:32	2025-07-19 15:01:30.378335	\N	\N	2025-07-19 15:01:30.378335
69	NDIMANGOYE AMBOGO Marie Reine	Laboratoire	Technicienne sup‚rieur de labo	Absence	Obligation familiale	2024-12-23	2024-12-23	Approuvé	2025-07-19 15:01:35.329634	\N	2025-04-19 10:09:32	2025-07-19 15:01:35.329634	\N	\N	2025-07-19 15:01:35.329634
66	ANGONE EDOU Vasta	walyah	equipiŠre polyvalente	Absence	d‚cŠs de la grand-mŠre	2024-12-21	2024-12-21	Approuvé	2025-07-19 15:01:41.770144	\N	2025-04-19 10:09:32	2025-07-19 15:01:41.770144	\N	\N	2025-07-19 15:01:41.770144
63	MAHINDZA SAFIOU Anzimath	Accueil/Facturation	Agent d'accueil et facturation	Absence	Formalit‚ administrative	2024-12-19	2024-12-19	Approuvé	2025-07-19 15:01:53.342537	\N	2025-04-19 10:09:32	2025-07-19 15:01:53.342537	\N	\N	2025-07-19 15:01:53.342537
57	HADIZATOU Lawan	clinique	InfirmiŠre	Arrˆt maladie	Repos maladie	2024-11-30	2024-12-14	Approuvé	2025-07-19 15:02:06.33019	\N	2025-04-19 10:09:32	2025-07-19 15:02:06.33019	\N	\N	2025-07-19 15:02:06.33019
65	MBADINGA Mickala Stessy	clinique	Brancardier	Arrˆt maladie	Repos maladie	2024-12-19	2024-12-21	Approuvé	2025-07-19 15:02:11.154134	\N	2025-04-19 10:09:32	2025-07-19 15:02:11.154134	\N	\N	2025-07-19 15:02:11.154134
62	BIYEYEME Anais	Accueil/Facturation	responsable back office	Arrˆt maladie	Repos maladie	2024-12-17	2024-12-20	Approuvé	2025-07-19 15:02:17.865066	\N	2025-04-19 10:09:32	2025-07-19 15:02:17.865066	\N	\N	2025-07-19 15:02:17.865066
61	BADJINA Ingrid	Accueil/Facturation	Agent d'accueil et facturation	Absence	repos maladie	2024-12-14	2024-12-14	Approuvé	2025-07-19 15:02:23.545904	\N	2025-04-19 10:09:32	2025-07-19 15:02:23.545904	\N	\N	2025-07-19 15:02:23.545904
60	NYINDONG NZE Winona Oc‚ane	Walyah	EquipiŠre polyvalente	Arrˆt maladie	Repos maladie	2024-12-13	2024-12-14	Approuvé	2025-07-19 15:02:29.130254	\N	2025-04-19 10:09:32	2025-07-19 15:02:29.130254	\N	\N	2025-07-19 15:02:29.130254
64	KALUNGA BUBU BOY Charlotte	Accueil/Facturation	Agent d'accueil et facturation	Arrˆt maladie	Repos maladie	2024-12-11	2024-12-15	Approuvé	2025-07-19 15:02:37.809966	\N	2025-04-19 10:09:32	2025-07-19 15:02:37.809966	\N	\N	2025-07-19 15:02:37.809966
58	ANGONE EDOU Vasta	walyah	Vendeuse	Arrˆt maladie	Repos maladie	2024-12-10	2024-12-11	Approuvé	2025-07-19 15:02:44.61777	\N	2025-04-19 10:09:32	2025-07-19 15:02:44.61777	\N	\N	2025-07-19 15:02:44.61777
59	BEKALE HARB Curtis	Accueil/Facturation	Agent d'accueil ey fatcturation	Arrˆt maladie	Repos maladie	2024-12-04	2024-12-09	Approuvé	2025-07-19 15:02:52.010191	\N	2025-04-19 10:09:32	2025-07-19 15:02:52.010191	\N	\N	2025-07-19 15:02:52.010191
56	BOUSSOUGOU AHIAKPOR Samson	Accueil/Facturation	Agent de conciergerie	Arrˆt maladie	Repos maladie	2024-11-20	2024-11-22	Approuvé	2025-07-19 15:02:57.266116	\N	2025-04-19 10:09:32	2025-07-19 15:02:57.266116	\N	\N	2025-07-19 15:02:57.266116
55	NGO NTJAM Elisabeth	Laboratoire	Technicienne sup de labo	Arrˆt maladie	Repos maladie	2024-11-18	2024-11-19	Approuvé	2025-07-19 15:03:18.53317	\N	2025-04-19 10:09:32	2025-07-19 15:03:18.53317	\N	\N	2025-07-19 15:03:18.53317
53	KUMILUDE Ruphanie	Accueil/Facturation	Agent d'accueil et facturation	Arrˆt maladie	Repos maladie	2024-11-12	2024-11-13	Approuvé	2025-07-19 15:03:33.592117	\N	2025-04-19 10:09:32	2025-07-19 15:03:33.592117	\N	\N	2025-07-19 15:03:33.592117
51	NDONG EDOU Rubrice	Laboratoire	Technicien de laboratoire	Absence	Obligation familiale	2024-11-08	2024-11-08	Approuvé	2025-07-19 15:03:42.46553	\N	2025-04-19 10:09:32	2025-07-19 15:03:42.46553	\N	\N	2025-07-19 15:03:42.46553
52	DOUTSONA MFOUMBI Loraine Evy	Accueil/Facturation	Agent d'accueil et facturation	Arrˆt maladie	Repos maladie	2024-11-08	2024-11-09	Approuvé	2025-07-19 15:03:48.423968	\N	2025-04-19 10:09:32	2025-07-19 15:03:48.423968	\N	\N	2025-07-19 15:03:48.423968
50	BELLA NKOGHE Jorini Chancia Epse OBAME	Accueil/Facturation	Secr‚taire m‚dicale	Absence	D‚cŠs du beau pŠre	2024-11-07	2024-11-08	Approuvé	2025-07-19 15:03:55.898317	\N	2025-04-19 10:09:32	2025-07-19 15:03:55.898317	\N	\N	2025-07-19 15:03:55.898317
49	DOUTSONA MFOUMBI Loraine Evy	Accueil/Facturation	Agent d'acceuil et facturation	Arrˆt maladie	Repos maladie	2024-11-06	2024-11-07	Approuvé	2025-07-19 15:04:03.098639	\N	2025-04-19 10:09:32	2025-07-19 15:04:03.098639	\N	\N	2025-07-19 15:04:03.098639
113	POENOU Dissou Demagna	Hotellerie/Hospitalit‚/Buanderie/Self	Coursier administratif	Absence	Raison personnelle	2025-07-01	2025-09-01	Approuvé	2025-07-19 14:55:50.413102	\N	2025-06-19 13:23:38	2025-07-19 14:55:50.413102	2025-09-02	Non r‚mun‚r‚	2025-07-19 14:55:50.413102
115	MENGUE ME NDONG NANG El‚onore Berthe	Bureau des entr‚es	Agent call center	Absence	Formalit‚ administrative	2025-06-13	2025-06-13	Approuvé	2025-07-19 14:55:56.826381	\N	2025-06-19 13:23:38	2025-07-19 14:55:56.826381	2025-06-14	Non r‚mun‚r‚	2025-07-19 14:55:56.826381
114	DIBOUNGA Diane	Direction G‚n‚rale	Assistante de Direction	Arrˆt maladie	Repos maladie	2025-06-10	2025-06-12	Approuvé	2025-07-19 14:56:05.490099	\N	2025-06-19 13:23:38	2025-07-19 14:56:05.490099	2025-06-13	Non r‚mun‚r‚	2025-07-19 14:56:05.490099
109	DE SOUZA Ovidio	Clinique	M‚decin Radiologue	Absence	Raison personnelle	2025-04-18	2025-04-21	Approuvé	2025-07-19 14:56:12.217519	\N	2025-04-19 10:09:32	2025-07-19 14:56:12.217519	\N	\N	2025-07-19 14:56:12.217519
112	BOUSSIENGUI LISSOUMOU Darcy	walyah	EquipiŠre polyvalente	Absence	Droit de vote	2025-04-11	2025-04-11	Approuvé	2025-07-19 14:56:16.46619	\N	2025-04-19 10:09:32	2025-07-19 14:56:16.46619	\N	\N	2025-07-19 14:56:16.46619
110	BAYAKABOMA P‚tula	Clinique	InfirmiŠre	Arrˆt maladie	repos maladie	2025-04-07	2025-04-17	Approuvé	2025-07-19 14:56:22.113666	\N	2025-04-19 10:09:32	2025-07-19 14:56:22.113666	\N	Non r‚mun‚r‚	2025-07-19 14:56:22.113666
111	NGO NTJAM Elisabeth	Laboratoire	TSBM	Arrˆt maladie	Repos maladie	2025-04-07	2025-04-11	Approuvé	2025-07-19 14:56:27.026551	\N	2025-04-19 10:09:32	2025-07-19 14:56:27.026551	\N	Non r‚mun‚r‚	2025-07-19 14:56:27.026551
108	SAVY ENAGNON Bricilia	Laboratoire	TSBM	Arrˆt maladie	repos maladie	2025-04-04	2025-04-05	Approuvé	2025-07-19 14:56:31.058478	\N	2025-04-19 10:09:32	2025-07-19 14:56:31.058478	\N	\N	2025-07-19 14:56:31.058478
106	MOUSSOUNDA SAJOUX Yohann	Accueil/Facturation	Agent d'accueil et facturation	Absence	Urgence familiale	2025-04-02	2025-04-03	Approuvé	2025-07-19 14:56:40.197568	\N	2025-04-19 10:09:32	2025-07-19 14:56:40.197568	\N	\N	2025-07-19 14:56:40.197568
105	DOUTSONA MFOUMBI Loraine Merlick	Accueil/Facturation	Agent d'accueil et facturation	Arrˆt maladie	repos maladie	2025-03-29	2025-04-03	Approuvé	2025-07-19 14:56:46.4744	\N	2025-04-19 10:09:32	2025-07-19 14:56:46.4744	\N	\N	2025-07-19 14:56:46.4744
99	MATAMBA NDEMBET F‚lie R.	Laboratoire	Secr‚taire m‚dicale	Absence	D‚cŠs	2025-03-28	2025-03-31	Approuvé	2025-07-19 14:56:50.961096	\N	2025-04-19 10:09:32	2025-07-19 14:56:50.961096	\N	\N	2025-07-19 14:56:50.961096
104	IBONDOU ‚pse SOUAMY Sylvanie	clinique	InfirmiŠre	Arrˆt maladie	repos maladie	2025-03-28	2025-03-28	Approuvé	2025-07-19 14:56:55.70625	\N	2025-04-19 10:09:32	2025-07-19 14:56:55.70625	\N	\N	2025-07-19 14:56:55.70625
96	SALOM RODRIGUEZ Yanet	Clinique	M‚decin G‚n‚raliste	Absence	Obligation familiale	2025-03-27	2025-04-01	Approuvé	2025-07-19 14:57:00.477845	\N	2025-04-19 10:09:32	2025-07-19 14:57:00.477845	\N	\N	2025-07-19 14:57:00.477845
102	MENGUE ME NDONG Eleonord	accueil/Facturation	agent call center	Arrˆt maladie	repos maladie	2025-03-25	2025-03-28	Approuvé	2025-07-19 14:57:05.842025	\N	2025-04-19 10:09:32	2025-07-19 14:57:05.842025	\N	\N	2025-07-19 14:57:05.842025
103	ANGONE EDOU Vasta	Walyah	EquipiŠre polyvalente	Arrˆt maladie	repos maladie	2025-03-25	2025-03-27	Approuvé	2025-07-19 14:57:11.186418	\N	2025-04-19 10:09:32	2025-07-19 14:57:11.186418	\N	\N	2025-07-19 14:57:11.186418
101	NAHHAS Lorena	Hotellerie/entretien	Charg‚ de l'hygiŠne	Arrˆt maladie	repos maladie	2025-03-25	2025-03-28	Approuvé	2025-07-19 14:57:16.006062	\N	2025-04-19 10:09:32	2025-07-19 14:57:16.006062	\N	\N	2025-07-19 14:57:16.006062
98	MIHINDOU Carmen epse EYENE	accueil/Facturation	Agent d'accueil et facturation	Absence	Raison personnelle	2025-03-24	2025-03-24	Approuvé	2025-07-19 14:57:20.754205	\N	2025-04-19 10:09:32	2025-07-19 14:57:20.754205	\N	\N	2025-07-19 14:57:20.754205
100	IFOUNGA IFOUNGA R‚ginalde	Laboratoire	TSBM	Arrˆt maladie	repos maladie	2025-03-24	2025-04-03	Approuvé	2025-07-19 14:57:25.625952	\N	2025-04-19 10:09:32	2025-07-19 14:57:25.625952	\N	\N	2025-07-19 14:57:25.625952
97	DOUTSONA MFOUMBI Loraine Merlick	accueil/Facturation	Agent d'accueil et facturation	Arrˆt maladie	Repos maladie	2025-03-22	2025-03-26	Approuvé	2025-07-19 14:57:31.081859	\N	2025-04-19 10:09:32	2025-07-19 14:57:31.081859	\N	\N	2025-07-19 14:57:31.081859
107	NTOUTOUME ANGOUE Marie-Th‚rŠse	\N	InfirmiŠre	Arrˆt maladie	repos maladie	2025-03-22	2025-04-04	Approuvé	2025-07-19 14:57:36.015761	\N	2025-04-19 10:09:32	2025-07-19 14:57:36.015761	\N	\N	2025-07-19 14:57:36.015761
95	BIVIGOU DICKOBOU	Accueil/Facturation	Agent d'acceuil et facturation	Arrˆt maladie	Repos maladie	2025-03-20	2025-03-21	Approuvé	2025-07-19 14:57:47.64179	\N	2025-04-19 10:09:32	2025-07-19 14:57:47.64179	\N	\N	2025-07-19 14:57:47.64179
1	MEGUE ME NDONG Eleonore	Accueil/Facturation	Agent call center	Arrˆt maladie	Repos maladie	2024-02-23	2024-02-20	Approuvé	2025-07-19 14:58:05.420166	\N	2025-04-19 10:09:32	2025-07-19 14:58:05.420166	\N	\N	2025-07-19 14:58:05.420166
85	NKOGHO ETOUGHE BIYOGHE Johan	Informatique	stagiaire it	Arrˆt maladie	repos maladie	2025-02-26	2025-02-28	Approuvé	2025-07-19 14:59:45.725198	\N	2025-04-19 10:09:32	2025-07-19 14:59:45.725198	\N	\N	2025-07-19 14:59:45.725198
76	EMVO BARRO Lanslow Abou	accueil/Facturation	agent d'accueil et facturation	Arrˆt maladie	Repos maladie	2025-01-03	2025-01-05	Approuvé	2025-07-19 15:00:43.905476	\N	2025-04-19 10:09:32	2025-07-19 15:00:43.905476	\N	\N	2025-07-19 15:00:43.905476
68	NDIMANGOYE AMBOGO Marie Reine	Clinique	Technicienne sup‚rieur de labo	Absence	C‚r‚monie religieuse	2024-12-20	2024-12-20	Approuvé	2025-07-19 15:01:47.905417	\N	2025-04-19 10:09:32	2025-07-19 15:01:47.905417	2024-12-21		2025-07-19 15:01:47.905417
54	MENGUE NZE Oriole Sonia	clinique	stagiaire imagerie	Absence	Formalit‚ administrative	2024-11-13	2024-11-13	Approuvé	2025-07-19 15:03:24.580559	\N	2025-04-19 10:09:32	2025-07-19 15:03:24.580559	\N	\N	2025-07-19 15:03:24.580559
34	BOUSSOUGOU AHIAKPOR Samson	Accueil/Facturation	Agent d'accueil et facturation	Absence	Formalit‚ administrative	2024-10-31	2024-10-31	Approuvé	2025-08-05 07:55:49.133544	\N	2025-04-19 10:09:32	2025-08-05 07:55:49.133544	\N	\N	2025-08-05 07:55:49.133544
33	DIVEMBA BOUKA Lodie Esp‚rence	Accueil/Facturation	Agent d'accueil et facturation	Absence	Affection m‚dicale	2024-10-23	2024-10-23	Approuvé	2025-08-05 07:57:37.687389	\N	2025-04-19 10:09:32	2025-08-05 07:57:37.687389	\N	\N	2025-08-05 07:57:37.687389
27	NZAMBA TSOMAKEKA Esther E.	laboratoire	Technicienne laboratoire	Absence	Obligation familiale	2024-10-11	2024-11-11	Approuvé	2025-08-05 07:59:02.095323	\N	2025-04-19 10:09:32	2025-08-05 07:59:02.095323	\N	\N	2025-08-05 07:59:02.095323
18	MBOUMBA Lisa Olivia Lucie	Clinique	InfirmiŠre	Arrˆt maladie	Affection m‚dicale	2024-09-27	2024-10-27	Approuvé	2025-08-05 08:00:11.026924	\N	2025-04-19 10:09:32	2025-08-05 08:00:11.026924	\N	\N	2025-08-05 08:00:11.026924
9	BIYEYEME Anais	Accueil/Facturation	responsable back office	Arrˆt maladie	Repos maladie	2024-09-02	2024-09-03	Approuvé	2025-08-05 08:01:30.879862	\N	2025-04-19 10:09:32	2025-08-05 08:01:30.879862	\N	\N	2025-08-05 08:01:30.879862
\.


--
-- TOC entry 5232 (class 0 OID 41263)
-- Dependencies: 228
-- Data for Name: absences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.absences (id, nom_employe, service, poste, type_absence, motif, date_debut, date_fin, statut, date_traitement, document_path, date_creation, updated_at, date_retour, remuneration, date_modification) FROM stdin;
\.


--
-- TOC entry 5230 (class 0 OID 41238)
-- Dependencies: 226
-- Data for Name: conges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conges (id, nom_employe, service, poste, date_embauche, jours_conges_annuels, date_demande, date_debut, date_fin, motif, date_retour, jours_pris, jours_restants, date_prochaine_attribution, type_conge, statut, date_traitement, document_path) FROM stdin;
27	BEKALE HARB Curtis	Accueil/Facturation	Agent d'accueil et facturation	2023-09-18	34	2025-04-01	2025-04-01	2025-05-12	\N	2025-05-13	34	0	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:11.002067	\N
53	PANGA ChimŠne	Clinique	InfirmiŠre	2023-06-13	42	2025-03-20	2025-03-20	2025-04-24	\N	2025-04-25	30	13	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:12.826901	\N
26	NZE ONDO Christelle	Hotellerie/Hospitalit‚/Buanderie/Self	Agent d'entretien	2021-09-01	24	2025-03-18	2025-03-18	2025-04-18	\N	2025-04-19	24	0	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:15.635581	\N
50	MATAMBA NDEMBET Felie	Laboratoire	Secr‚taire m‚dicale	2023-11-07	24	2025-02-17	2025-02-17	2025-03-01	\N	2025-02-17	27	-3	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:17.737242	\N
24	EMVO BARRO Lanslow Abou	Accueil/Facturation	Agent d'accueil et facturation	2023-09-18	24	2025-02-17	2025-02-17	2025-03-15	\N	2025-03-17	12	15	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:20.536943	\N
41	VENGA ENGO Nancy	Clinique	Majore infirmiŠre	2022-09-01	48	2025-01-02	2025-01-02	2025-02-08	\N	2025-02-10	30	18	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:23.441897	\N
42	MANSIR ELLA Michelle	Clinique	M‚decin g‚n‚raliste	2023-11-21	27	2025-01-06	2025-01-06	2025-02-05	\N	2025-02-06	27	0	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:26.161329	\N
23	MATOUNGOU KOMBA Blandine	Laboratoire	TSBM	2024-04-03	15	2025-02-11	2025-02-11	2025-02-27	\N	2025-02-28	15	0	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:28.433462	\N
48	MAGONGA LEGNONGO CrŠs Caleb	Hotellerie/Hospitalit‚/Buanderie/Self	cuisinier	2023-11-27	26	2025-02-10	2025-02-10	2025-02-22	\N	2025-02-24	26	0	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:30.98555	\N
49	KEMEGNE NOUMENI Carmen	Clinique	InfirmiŠre	2023-07-20	\N	2025-02-09	2025-02-09	2025-02-28	\N	2025-03-01	\N	\N	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:35.28174	\N
44	DIBOUNGA Diane	Direction G‚n‚rale	Assistante du Directeur g‚n‚ral	2021-12-09	73	2024-12-23	2024-12-23	2025-01-31	\N	2025-02-03	33	40	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:39.738317	\N
18	ANGUE ELLA Ines	Clinique	InfirmiŠre	2022-09-12	36	2024-01-13	2024-01-13	2025-02-22	\N	2025-02-24	36	0	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:43.345035	\N
45	BOUNGOUERE MABE Cephora	Accueil/Facturation	Agent d'accueil et facturation	2023-07-01	37	2025-01-07	2025-01-07	2025-01-18	\N	2025-02-19	37	0	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:46.753527	\N
47	UZODIMA CHIOMA	Accueil/Facturation	Secr‚taire m‚dicale	2023-04-03	\N	2025-01-20	2025-01-20	2025-02-20	\N	2025-02-21	\N	\N	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:49.626962	\N
40	DJIEUKAM TOKO Danielle	Clinique	Gastro-Enterologue	2024-05-03	12	2024-12-20	2024-12-20	2025-01-05	\N	2025-01-05	12	0	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:52.201457	\N
39	ONDOUA Fernandez Mesmin	Clinique	M‚decin	2023-02-21	44	2024-12-18	2024-12-18	2024-12-18	\N	2025-02-10	0	\N	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:55.474276	\N
15	NGWE TAKA Prisca	Clinique	sage-femme	2022-02-14	\N	2024-12-11	2024-12-11	2024-12-22	\N	2024-12-23	15	-15	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:32:58.984661	\N
38	BAYACKABOMA Petula	Clinique	Infirmier(Šre)	2023-02-01	\N	2024-09-09	2024-09-09	2024-10-12	\N	2024-10-14	\N	\N	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:33:01.976687	\N
35	ZOUGOU TOVIGNON YONDJEU Alice Claudia	Hotellerie/Hospitalit‚/Buanderie/Self	Responsable accueil	2021-10-01	24	2024-08-20	2024-08-20	2024-09-06	\N	2024-09-09	16	8	2025-09-01	Cong‚ pay‚	Approuvé	2025-07-19 14:33:05.3851	\N
3	DOMINGO Aude NadŠge	Laboratoire	Responsable laboratoire	2021-03-03	39	2024-08-19	2024-08-19	2024-09-03	\N	2024-09-04	14	25	2025-09-01	Cong‚ pay‚	Approuvé	2025-07-19 14:33:09.299114	\N
33	NGUEMBIT NGUEMBIT Mayit‚	Clinique	Infirmier(Šre) assistant(e)	2022-03-11	26	2024-08-05	2024-08-05	2024-09-05	\N	2024-09-06	26	0	2025-08-01	Cong‚ pay‚	Approuvé	2025-07-19 14:33:11.921563	\N
34	SANMA FARID	Clinique	M‚decin anesth‚siste-r‚animateur	2022-11-01	27	2024-08-01	2024-08-01	2024-09-04	\N	2024-09-05	27	0	2025-09-01	Cong‚ pay‚	Approuvé	2025-07-19 14:33:14.600704	\N
2	CHITOU Bilkis Epse SANMA Folachad‚ AmakŠ	Clinique	M‚decin gyn‚cologue	2022-11-01	27	2024-08-01	2024-08-01	2024-09-04	\N	2024-09-05	27	0	2025-09-01	Cong‚ pay‚	Approuvé	2025-07-19 14:33:18.737115	\N
37	RAMAROJAONA HARIVELO Serge	Clinique	M‚decin p‚diatre	2023-08-01	27	2024-08-01	2024-08-01	2024-09-04	\N	2024-09-05	\N	\N	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:33:24.400954	\N
4	MATOUNGOU KOMBA Blandine	Laboratoire	Technicien sup‚rieur de laboratoire	2023-04-03	24	2024-07-08	2024-07-08	2024-07-20	\N	2024-07-22	12	12	2025-08-01	Cong‚ pay‚	Approuvé	2025-07-19 14:33:27.576804	\N
29	BIYEYEME NKYE Anais Keshya	Cotation	Agent administratif	2021-10-01	42	2024-07-26	2024-07-26	2024-08-22	\N	2024-08-23	21	21	2025-08-01	Cong‚ pay‚	Approuvé	2025-07-19 14:33:30.352909	\N
36	CHITOU Bilkis Epse SANMA Folachad‚ AmakŠ	Clinique	M‚decin gyn‚cologue	2022-11-01	27	2024-07-30	2024-07-30	2024-07-04	\N	2024-09-05	\N	\N	\N	Cong‚ pay‚	Approuvé	2025-07-19 14:33:33.330398	\N
28	MBOUMBA Rita Joyce	Marketing/Communication	Responsable communication	2022-12-31	50	2025-09-03	2025-04-06	2025-04-29	\N	2025-05-01	24	26	\N	Cong‚ pay‚	En attente	2025-07-19 14:32:14.114562	\N
9	NKOMA	RH	Responsable RH	2020-01-15	25	2025-09-05	2025-01-20	2025-01-25	Congé annuel pour repos familial	2025-01-26	5	20	2026-01-15	Congé payé	En attente	\N	\N
10	NKOMA TCHIKA Paule Winnya	RH	Responsable RH	2020-01-15	25	2025-09-05	2025-01-20	2025-01-25	Congé annuel pour repos familial	2025-01-26	5	20	2026-01-15	Congé payé	En attente	\N	\N
11	NKOMA TCHIKA Paule Winnya	RH	Responsable RH	2020-01-15	25	2025-09-05	2025-01-20	2025-01-25	Congé annuel pour repos familial	2025-01-26	5	20	2026-01-15	Congé payé	En attente	\N	\N
12	NKOMA TCHIKA Paule Winnya	RH	Responsable RH	2020-01-15	25	2025-09-05	2025-01-20	2025-01-25	Congé annuel pour repos familial	2025-01-26	5	20	2026-01-15	Congé payé	En attente	\N	\N
13	NKOMA TCHIKA Paule Winnya	RH	Responsable RH	2020-01-15	25	2025-09-05	2025-01-20	2025-01-25	Congé annuel pour repos familial	2025-01-26	5	20	2026-01-15	Congé payé	En attente	\N	\N
\.


--
-- TOC entry 5256 (class 0 OID 59330)
-- Dependencies: 252
-- Data for Name: contrats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contrats (id, employee_id, type_contrat, date_debut, date_fin, statut, salaire, created_at, updated_at, poste, service, contrat_content, numero_contrat, titre_poste, departement, salaire_brut, salaire_net, type_remuneration, mode_paiement, periode_essai, date_fin_essai, lieu_travail, horaires_travail, superieur_hierarchique, motif_contrat, conditions_particulieres, avantages_sociaux, date_signature, date_effet, motif_resiliation, date_resiliation, notes) FROM stdin;
105	125	stage PNPE	2024-12-19	\N	Actif	\N	2025-08-14 16:38:44.271	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-105	Stagiaire infirmière polyvalente		\N	0.00	Indemnit‚ de Stage	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-19	\N	\N	\N
106	126	CDD	2025-01-14	\N	Actif	\N	2025-08-14 16:38:44.272	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-106	Infirmière		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-14	\N	\N	\N
107	127	prestataire	2024-12-11	\N	Actif	\N	2025-08-14 16:38:44.272	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-107	Medecin généraliste		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-11	\N	\N	\N
108	131	CDD	2024-08-27	\N	Actif	\N	2025-08-14 16:38:44.272	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-108	Agent d'accueil et facturation		\N	5000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-08-27	\N	\N	\N
109	135	CDD	2024-12-08	\N	Actif	\N	2025-08-14 16:38:44.273	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-109	Équipière polyvalente		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-08	\N	\N	\N
110	136	CDD	2024-05-06	\N	Actif	\N	2025-08-14 16:38:44.275	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-110	Technicienne de laboratoire		\N	97000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-05-06	\N	\N	\N
111	137	CDD	2024-08-27	\N	Actif	\N	2025-08-14 16:38:44.276	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-111	Agent d'accueil et facturation		\N	5000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-08-27	\N	\N	\N
112	138	Prestataire	2023-04-05	\N	Actif	\N	2025-08-14 16:38:44.276	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-112	Agent d'entretien		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-04-05	\N	\N	\N
113	139	CDI	2024-12-15	\N	Actif	\N	2025-08-14 16:38:44.277	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-113	Responsable bureau des entrées		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-15	\N	\N	\N
2	5	Prestataire	2023-07-23	\N	Actif	\N	2025-08-14 14:44:02.436268	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-2	Sécrétaire médicale		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-07-23	\N	\N	\N
3	8	CDD	2024-12-01	\N	Actif	\N	2025-08-14 14:44:02.436268	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-3	Technicien supérieur de biologie médicale		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-01	\N	\N	\N
4	6	Prestataire	2024-01-01	\N	Actif	\N	2025-08-14 14:44:02.436268	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-4	VP-Médecin réanimateur anesthésiste		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-01-01	\N	\N	\N
5	9	CDI	2022-10-31	\N	Actif	\N	2025-08-14 14:44:02.436268	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-5	Technicien supérieur en imagerie médicale		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-10-31	\N	\N	\N
6	1	CDD	2024-12-31	\N	Actif	\N	2025-08-14 14:44:02.436268	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-6	Agent d'accueil et facturation		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-31	\N	\N	\N
7	3	CDD	2024-10-01	\N	Actif	\N	2025-08-14 14:44:02.436268	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-7	Assistante comptable		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-01	\N	\N	\N
8	10	Prestataire	2024-06-25	\N	Actif	\N	2025-08-14 14:44:02.436268	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-8	Médecin généraliste		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-06-25	\N	\N	\N
9	19	CDI	2024-02-21	\N	Actif	\N	2025-08-14 14:44:02.436268	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-9	Secrétaire médicale		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-02-21	\N	\N	\N
10	20	Prestataire	2022-02-28	\N	Actif	\N	2025-08-14 14:44:02.436268	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-10	Médecin Généraliste de garde		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-02-28	\N	\N	\N
11	11	CDD	2024-10-20	\N	Actif	\N	2025-08-14 16:38:44.218	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-11	Équipière polyvalente		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-20	\N	\N	\N
12	12	Prestataire	2024-04-21	\N	Actif	\N	2025-08-14 16:38:44.227	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-12	Infirmier		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-04-21	\N	\N	\N
13	13	CDI	2022-09-11	\N	Actif	\N	2025-08-14 16:38:44.229	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-13	Infirmier(Ère)		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-09-11	\N	\N	\N
14	14	Prestataire	2025-01-27	\N	Actif	\N	2025-08-14 16:38:44.23	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-14	Infirmière		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-27	\N	\N	\N
15	15	CDD	2024-08-27	\N	Actif	\N	2025-08-14 16:38:44.232	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-15	Agent d'accueil et facturation		\N	5000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-08-27	\N	\N	\N
16	16	Prestataire	2021-06-15	\N	Actif	\N	2025-08-14 16:38:44.232	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-16	Biologiste		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2021-06-15	\N	\N	\N
114	140	CDI	2021-09-01	\N	Actif	\N	2025-08-14 16:38:44.278	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-114	Agent d'entretien		\N	\N	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2021-09-01	\N	\N	\N
17	17	CDI	2023-02-01	\N	Actif	\N	2025-08-14 16:38:44.233	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-17	Infirmier(Šre)		\N	30000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-02-01	\N	\N	\N
18	18	CDD	2023-09-18	\N	Actif	\N	2025-08-14 16:38:44.234	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-18	Agent d'accueil et facturation		\N	30000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-09-18	\N	\N	\N
19	21	CDD	2024-12-07	\N	Actif	\N	2025-08-14 16:38:44.234	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-19	Secrétaire médicale		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-07	\N	\N	\N
20	22	CDI	2021-10-01	\N	Actif	\N	2025-08-14 16:38:44.235	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-20	Responsable Cotation		\N	\N	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2021-10-01	\N	\N	\N
21	24	CDI	2023-07-01	\N	Actif	\N	2025-08-14 16:38:44.235	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-21	Agent d'accueil et facturation		\N	30000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-07-01	\N	\N	\N
22	25	CDD	2025-02-19	\N	Actif	\N	2025-08-14 16:38:44.236	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-22	Équipière polyvalente		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-02-19	\N	\N	\N
23	26	CDI	2022-10-01	\N	Actif	\N	2025-08-14 16:38:44.236	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-23	Agent d'accueil et facturation		\N	30000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-10-01	\N	\N	\N
24	27	CDI	2022-10-31	\N	Actif	\N	2025-08-14 16:38:44.236	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-24	Médecin gynécologue		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-10-31	\N	\N	\N
25	28	CDI	2023-02-22	\N	Actif	\N	2025-08-14 16:38:44.237	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-25	Infirmier(Šre)		\N	27500.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-02-22	\N	\N	\N
26	30	Prestataire	2023-02-21	\N	Actif	\N	2025-08-14 16:38:44.237	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-26	Infirmier(Šre)		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-02-21	\N	\N	\N
27	31	CDI	2021-12-09	\N	Actif	\N	2025-08-14 16:38:44.238	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-27	Assistance de Direction		\N	120000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2021-12-09	\N	\N	\N
28	32	CDD	2025-01-01	\N	Actif	\N	2025-08-14 16:38:44.238	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-28	Agent d'accueil et facturation		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-01	\N	\N	\N
29	33	CDD	2024-08-26	\N	Actif	\N	2025-08-14 16:38:44.238	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-29	Agent d'accueil et facturation		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-08-26	\N	\N	\N
30	34	CDD	2023-11-14	\N	Actif	\N	2025-08-14 16:38:44.239	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-30	Médecin gastro-entérologue		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-11-14	\N	\N	\N
31	35	CDD	2024-10-01	\N	Actif	\N	2025-08-14 16:38:44.239	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-31	Agent de saisie et cotation		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-01	\N	\N	\N
32	37	Prestataire	2021-10-01	\N	Actif	\N	2025-08-14 16:38:44.239	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-32	Biologiste		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2021-10-01	\N	\N	\N
33	38	CDD	2024-06-01	\N	Actif	\N	2025-08-14 16:38:44.24	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-33	Sage-femme		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-06-01	\N	\N	\N
34	39	CDD	2025-01-01	\N	Actif	\N	2025-08-14 16:38:44.24	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-34	Agent d'accueil et facturation		\N	3000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-01	\N	\N	\N
35	40	CDI	2023-06-30	\N	Actif	\N	2025-08-14 16:38:44.241	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-35	Agent d'accueil et facturation		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-06-30	\N	\N	\N
37	42	CDD	2023-09-18	\N	Actif	\N	2025-08-14 16:38:44.241	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-37	Agent d'accueil et facturation		\N	30000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-09-18	\N	\N	\N
38	43	Prestataire	2023-04-06	\N	Actif	\N	2025-08-14 16:38:44.242	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-38	Technicien Endoscopie		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-04-06	\N	\N	\N
39	44	CDD	2024-11-04	\N	Actif	\N	2025-08-14 16:38:44.243	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-39	Sage-femme Principale		\N	187450.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-11-04	\N	\N	\N
40	45	CDD	2024-08-31	\N	Actif	\N	2025-08-14 16:38:44.244	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-40	Chargé de la Formation		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-08-31	\N	\N	\N
41	46	Prestataire	2024-08-31	\N	Actif	\N	2025-08-14 16:38:44.245	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-41	Directeur Développement et de la Stratégique		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-08-31	\N	\N	\N
42	48	Prestataire	2024-07-15	\N	Actif	\N	2025-08-14 16:38:44.245	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-42	Infirmier(ère) (Labo)		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-07-15	\N	\N	\N
43	49	stage PNPE	2024-12-06	\N	Actif	\N	2025-08-14 16:38:44.246	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-43	Stagiaire Agent de saisie et cotation		\N	\N	Indemnit‚ de Stage	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-06	\N	\N	\N
44	50	Prestataire	2024-10-09	\N	Actif	\N	2025-08-14 16:38:44.246	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-44	Professeur en cardiologie		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-09	\N	\N	\N
45	51	Prestataire	2024-06-25	\N	Actif	\N	2025-08-14 16:38:44.247	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-45	Agent d'entretien		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-06-25	\N	\N	\N
46	52	CDD	2024-04-01	\N	Actif	\N	2025-08-14 16:38:44.247	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-46	Infirmier(ère)		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-04-01	\N	\N	\N
47	53	Prestataire	2022-09-30	\N	Actif	\N	2025-08-14 16:38:44.247	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-47	Technicien supérieur de laboratoire		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-09-30	\N	\N	\N
48	54	CDI	2024-07-31	\N	Actif	\N	2025-08-14 16:38:44.248	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-48	Caissière Principale		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-07-31	\N	\N	\N
49	55	CDD	2024-08-27	\N	Actif	\N	2025-08-14 16:38:44.248	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-49	Agent d'Accueil et Administratif		\N	5000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-08-27	\N	\N	\N
50	56	Prestataire	2022-12-13	\N	Actif	\N	2025-08-14 16:38:44.249	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-50	Médecin Généraliste de garde		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-12-13	\N	\N	\N
51	57	CDD	2023-10-13	\N	Actif	\N	2025-08-14 16:38:44.249	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-51	Agent call center		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-10-13	\N	\N	\N
52	58	Prestataire	2022-09-30	\N	Actif	\N	2025-08-14 16:38:44.25	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-52	Infirmier(ère) polyvalente en cardio		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-09-30	\N	\N	\N
53	59	Prestataire	2023-07-19	\N	Actif	\N	2025-08-14 16:38:44.251	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-53	Infirmier(ère) gastro		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-07-19	\N	\N	\N
54	60	Prestataire	2024-06-25	\N	Actif	\N	2025-08-14 16:38:44.251	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-54	Médecin généraliste de garde		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-06-25	\N	\N	\N
55	61	Prestataire	2024-02-13	\N	Actif	\N	2025-08-14 16:38:44.251	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-55	Infirmier(ère)		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-02-13	\N	\N	\N
56	62	CDD	2024-10-01	\N	Actif	\N	2025-08-14 16:38:44.252	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-56	Assistante Dentaire		\N	100097.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-01	\N	\N	\N
57	63	CDD	2024-08-27	\N	Actif	\N	2025-08-14 16:38:44.252	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-57	Agent d'accueil et facturation		\N	5000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-08-27	\N	\N	\N
58	64	CDI	2023-02-26	\N	Actif	\N	2025-08-14 16:38:44.252	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-58	Infirmier(ère)		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-02-26	\N	\N	\N
59	65	CDD	2023-11-26	\N	Actif	\N	2025-08-14 16:38:44.253	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-59	Cuisinier principal		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-11-26	\N	\N	\N
60	66	CDD	2023-11-06	\N	Actif	\N	2025-08-14 16:38:44.253	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-60	Agent d'accueil et facturation		\N	79100.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-11-06	\N	\N	\N
61	67	prestataire	2024-11-24	\N	Actif	\N	2025-08-14 16:38:44.253	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-61	Medecin généraliste de garde		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-11-24	\N	\N	\N
62	68	CDD	2025-02-02	\N	Actif	\N	2025-08-14 16:38:44.254	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-62	Infirmière Assistante		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-02-02	\N	\N	\N
63	69	CDD	2023-11-20	\N	Actif	\N	2025-08-14 16:38:44.254	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-63	Médecin Généraliste		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-11-20	\N	\N	\N
64	70	CDD	2023-11-06	\N	Actif	\N	2025-08-14 16:38:44.254	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-64	Secrétaire médicale		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-11-06	\N	\N	\N
65	71	CDI	2024-04-02	\N	Actif	\N	2025-08-14 16:38:44.255	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-65	Technicien supérieur de laboratoire		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-04-02	\N	\N	\N
66	72	prestataire	2025-01-29	\N	Actif	\N	2025-08-14 16:38:44.255	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-66	Infirmière		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-29	\N	\N	\N
67	73	CDI	2024-12-31	\N	Actif	\N	2025-08-14 16:38:44.255	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-67	Médecin généraliste		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-31	\N	\N	\N
68	74	Prestataire	2024-01-12	\N	Actif	\N	2025-08-14 16:38:44.256	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-68	Agent d'entretien		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-01-12	\N	\N	\N
69	75	Prestataire	2023-09-17	\N	Actif	\N	2025-08-14 16:38:44.256	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-69	Infirmier(ère) assistant(e)		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-09-17	\N	\N	\N
70	76	CDD	2024-12-16	\N	Actif	\N	2025-08-14 16:38:44.256	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-70	Brancardier		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-16	\N	\N	\N
71	77	stage PNPE	2024-12-19	\N	Actif	\N	2025-08-14 16:38:44.257	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-71	Stagiaire infirmière polyvalente		\N	0.00	Indemnit‚ de Stage	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-19	\N	\N	\N
72	78	CDD	2025-01-01	\N	Actif	\N	2025-08-14 16:38:44.257	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-72	Infirmière		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-01	\N	\N	\N
73	82	CDD	2025-02-17	\N	Actif	\N	2025-08-14 16:38:44.257	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-73	Médecin Cardiologue		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-02-17	\N	\N	\N
74	83	CDD	2025-02-03	\N	Actif	\N	2025-08-14 16:38:44.258	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-74	Sage-femme		\N	28000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-02-03	\N	\N	\N
75	85	stage PNPE	2024-08-05	\N	Actif	\N	2025-08-14 16:38:44.259	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-75	Stagiaire Imagerie Médicale		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-08-05	\N	\N	\N
76	89	CDD	2023-01-01	\N	Actif	\N	2025-08-14 16:38:44.259	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-76	Responsable communication		\N	180000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-01-01	\N	\N	\N
77	94	CDI	2022-09-01	\N	Actif	\N	2025-08-14 16:38:44.26	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-77	Agent call center		\N	30000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-09-01	\N	\N	\N
78	96	CDD	2024-12-16	\N	Actif	\N	2025-08-14 16:38:44.26	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-78	Brancardier		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-16	\N	\N	\N
79	97	CDD	2024-06-01	\N	Actif	\N	2025-08-14 16:38:44.26	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-79	Agent d'accueil et facturation		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-06-01	\N	\N	\N
80	98	CDD	2024-11-30	\N	Actif	\N	2025-08-14 16:38:44.261	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-80	Technicien supérieur de laboratoire		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-11-30	\N	\N	\N
81	99	CDD	2024-11-18	\N	Actif	\N	2025-08-14 16:38:44.261	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-81	Cuisinier		\N	105469.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-11-18	\N	\N	\N
82	100	Prestataire	2024-01-01	\N	Actif	\N	2025-08-14 16:38:44.261	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-82	Médecin Généraliste de garde		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-01-01	\N	\N	\N
83	101	Prestataire	2024-01-12	\N	Actif	\N	2025-08-14 16:38:44.262	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-83	Agent d'entretien		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-01-12	\N	\N	\N
84	102	CDD	2024-12-08	\N	Actif	\N	2025-08-14 16:38:44.262	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-84	Agent d'accueil et facturation		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-08	\N	\N	\N
85	103	CDD	2025-01-01	\N	Actif	\N	2025-08-14 16:38:44.263	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-85	Secrétaire médicale		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-01	\N	\N	\N
86	104	Prestataire	2023-05-31	\N	Actif	\N	2025-08-14 16:38:44.263	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-86	Médecin Généraliste		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-05-31	\N	\N	\N
87	105	CDD	2024-12-09	\N	Actif	\N	2025-08-14 16:38:44.263	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-87	Agent d'accueil et facturation		\N	5000.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-09	\N	\N	\N
88	106	prestataire	2025-01-28	\N	Actif	\N	2025-08-14 16:38:44.264	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-88	Infirmière		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-28	\N	\N	\N
89	107	CDD	2024-09-30	\N	Actif	\N	2025-08-14 16:38:44.264	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-89	Infirmière		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-30	\N	\N	\N
90	109	Prestataire	2022-03-31	\N	Actif	\N	2025-08-14 16:38:44.265	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-90	Infirmier(ère) Major		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-03-31	\N	\N	\N
92	111	CDD	2024-12-02	\N	Actif	\N	2025-08-14 16:38:44.265	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-92	Cuisinier		\N	78611.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-02	\N	\N	\N
93	112	CDD	2025-02-04	\N	Actif	\N	2025-08-14 16:38:44.266	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-93	Infirmière Assistante		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-02-04	\N	\N	\N
94	113	Prestataire	2024-11-24	\N	Actif	\N	2025-08-14 16:38:44.266	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-94	Medecin généraliste de garde		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-11-24	\N	\N	\N
95	114	Prestataire	2022-07-06	\N	Actif	\N	2025-08-14 16:38:44.266	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-95	Technicien supérieur de laboratoire		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-07-06	\N	\N	\N
96	115	stage PNPE	2024-12-20	\N	Actif	\N	2025-08-14 16:38:44.266	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-96	Stagiaire infirmier d'Etat polyvalent		\N	\N	Indemnit‚ de Stage	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-20	\N	\N	\N
97	116	prestataire	2025-01-25	\N	Actif	\N	2025-08-14 16:38:44.267	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-97	Infirmière		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-25	\N	\N	\N
98	117	prestataire	2025-01-26	\N	Actif	\N	2025-08-14 16:38:44.267	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-98	Infirmière		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-26	\N	\N	\N
99	118	stage PNPE	2024-12-19	\N	Actif	\N	2025-08-14 16:38:44.267	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-99	Stagiaire infirmière polyvalente		\N	0.00	Indemnit‚ de Stage	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-19	\N	\N	\N
100	119	Prestataire	2024-11-19	\N	Actif	\N	2025-08-14 16:38:44.268	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-100	Technicien supérieur d'imagerie médicale		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-11-19	\N	\N	\N
101	120	CDI	2022-03-10	\N	Actif	\N	2025-08-14 16:38:44.268	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-101	Infirmier(ère) assistant(e)		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-03-10	\N	\N	\N
102	121	Prestataire	2021-02-13	\N	Actif	\N	2025-08-14 16:38:44.269	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-102	Infirmier(ère)		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2021-02-13	\N	\N	\N
36	41	CDD	2024-08-31	\N	Actif	350000.00	2025-08-14 16:38:44.241	2025-09-03 10:13:03.561757	Assistante RH	RH	\N	CONTRAT-36	Assistante rh		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-08-31	\N	\N	\N
116	142	CDD	2024-05-01	\N	Actif	\N	2025-08-14 16:38:44.28	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-116	Cuisinier		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-05-01	\N	\N	\N
117	143	CDD	2025-01-05	\N	Actif	\N	2025-08-14 16:38:44.28	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-117	Médecin Généraliste		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-05	\N	\N	\N
118	144	Prestataire	2024-01-31	\N	Actif	\N	2025-08-14 16:38:44.282	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-118	Manipulateur imagérie		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-01-31	\N	\N	\N
119	145	Prestataire	2023-04-25	\N	Actif	\N	2025-08-14 16:38:44.283	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-119	Buandière		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-04-25	\N	\N	\N
120	146	CDD	2025-02-04	\N	Actif	\N	2025-08-14 16:38:44.284	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-120	Infirmière Assistante		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-02-04	\N	\N	\N
121	147	CDD	2024-10-02	\N	Actif	\N	2025-08-14 16:38:44.284	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-121	Agent de saisie et cotation		\N	78200.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-02	\N	\N	\N
122	148	CDI	2025-03-03	\N	Actif	\N	2025-08-14 16:38:44.285	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-122	Superviseur Achat et Stock		\N	249461.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-03-03	\N	\N	\N
123	149	CDI	2020-12-31	\N	Actif	\N	2025-08-14 16:38:44.285	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-123	Président Directeur Général		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2020-12-31	\N	\N	\N
124	150	CDD	2024-05-06	\N	Actif	\N	2025-08-14 16:38:44.286	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-124	Technicien de laboratoire		\N	\N	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-05-06	\N	\N	\N
125	151	Prestataire	2024-06-01	\N	Actif	\N	2025-08-14 16:38:44.286	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-125	Agent de cotation		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-06-01	\N	\N	\N
126	152	Prestataire	2023-02-09	\N	Actif	\N	2025-08-14 16:38:44.287	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-126	Médecin Généraliste		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-02-09	\N	\N	\N
127	153	CDI	2022-12-24	\N	Actif	\N	2025-08-14 16:38:44.287	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-127	Infirmier(ère) d'état		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-12-24	\N	\N	\N
128	154	prestataire	2024-11-23	\N	Actif	\N	2025-08-14 16:38:44.288	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-128	Medecin généraliste		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-11-23	\N	\N	\N
129	155	Prestataire	2024-11-21	\N	Actif	\N	2025-08-14 16:38:44.288	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-129	Medecin généraliste de garde		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-11-21	\N	\N	\N
130	156	CDD	2023-06-12	\N	Actif	\N	2025-08-14 16:38:44.289	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-130	Infirmier(ère)		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-06-12	\N	\N	\N
131	157	Prestataire	2024-01-01	\N	Actif	\N	2025-08-14 16:38:44.289	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-131	Coursier administratif		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-01-01	\N	\N	\N
132	158	Prestataire	2024-03-03	\N	Actif	\N	2025-08-14 16:38:44.29	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-132	Médecin généraliste		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-03-03	\N	\N	\N
133	160	prestataire	2024-01-01	\N	Actif	\N	2025-08-14 16:38:44.29	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-133	Manipulateur imagerie		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-01-01	\N	\N	\N
134	161	CDI	2022-10-31	\N	Actif	\N	2025-08-14 16:38:44.291	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-134	Médecin anesthésiste-réanimateur		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-10-31	\N	\N	\N
135	162	prestataire	2024-11-19	\N	Actif	\N	2025-08-14 16:38:44.291	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-135	Tecnicienne superieur de biologie médicale		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-11-19	\N	\N	\N
136	163	Prestataire	2024-02-29	\N	Actif	\N	2025-08-14 16:38:44.292	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-136	Infirmier(ère) assistant(e)		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-02-29	\N	\N	\N
137	164	Prestataire	2024-03-19	\N	Actif	\N	2025-08-14 16:38:44.292	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-137	Médecin Généraliste de garde		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-03-19	\N	\N	\N
138	166	CDI	2024-04-30	\N	Actif	\N	2025-08-14 16:38:44.296	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-138	Manipulateur imagérie		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-04-30	\N	\N	\N
139	167	CDI	2023-02-20	\N	Actif	\N	2025-08-14 16:38:44.297	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-139	Infirmier(ère)		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-02-20	\N	\N	\N
140	168	Prestataire	2023-04-02	\N	Actif	\N	2025-08-14 16:38:44.298	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-140	Secrétaire médicale imagérie		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2023-04-02	\N	\N	\N
141	169	CDI	2022-08-31	\N	Actif	\N	2025-08-14 16:38:44.299	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-141	Infirmier(ère) Major		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2022-08-31	\N	\N	\N
142	176	Local	2025-05-12	\N	Actif	\N	2025-08-14 16:38:44.299	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-142	Responsable laboratoire		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-05-12	\N	\N	\N
143	177	Local	2025-06-09	\N	Actif	\N	2025-08-14 16:38:44.3	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-143	Technicien laboratoire		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-06-09	\N	\N	\N
144	178	Local	2025-06-10	\N	Actif	\N	2025-08-14 16:38:44.301	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-144	Technicien laboratoire		\N	\N	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-06-10	\N	\N	\N
145	179	Local	2025-06-09	\N	Actif	\N	2025-08-14 16:38:44.302	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-145	Infirmière		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-06-09	\N	\N	\N
146	180	Local	2025-06-10	\N	Actif	\N	2025-08-14 16:38:44.303	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-146	Technicien laboratoire		\N	\N	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-06-10	\N	\N	\N
147	181	Local	2025-05-11	\N	Actif	\N	2025-08-14 16:38:44.304	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-147	Techinicienne Laboratoire		\N	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-05-11	\N	\N	\N
148	182	Local	2025-06-10	\N	Actif	\N	2025-08-14 16:38:44.304	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-148	Infirmier		\N	\N	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-06-10	\N	\N	\N
149	183	Local	2025-06-10	\N	Actif	\N	2025-08-14 16:38:44.305	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-149	Infirmier		\N	\N	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-06-10	\N	\N	\N
150	184	stage PNPE	2025-06-09	\N	Actif	\N	2025-08-14 16:38:44.305	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-150	Stagiaire Infirmière		\N	0.00	Indemnit‚ de Stage	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-06-09	\N	\N	\N
151	185	expatri‚	2025-06-10	\N	Actif	\N	2025-08-14 16:38:44.306	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-151	Technicienne laboratoire		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-06-10	\N	\N	\N
152	186	Local	2025-04-22	\N	Actif	\N	2025-08-14 16:38:44.306	2025-09-03 10:13:03.561757	\N	\N	\N	CONTRAT-152	Médecin généraliste		\N	0.00	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-04-22	\N	\N	\N
157	192	Local	2025-10-09	\N	Actif	150000.00	2025-08-14 16:38:44.31	2025-09-03 10:13:03.561757	Poste de test	Service de test	\N	CONTRAT-157	Technicien laboratoire		\N	\N	Honoraires	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-10-09	\N	\N	\N
104	124	CDD	2025-08-05	2026-07-30	Actif	300000.00	2025-08-14 16:38:44.269	2025-09-03 10:13:03.561757	Assistante projet IT & Developpeuse web	IT	\N	CONTRAT-104	Assistante projet IT & Developpeuse		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-05	\N	\N	\N
103	122	CDD	2024-10-11	\N	Actif	450000.00	2025-08-14 16:38:44.269	2025-09-03 10:13:03.561757	Développeur web	IT	\N	CONTRAT-103	Developpeur full stack		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-11	\N	\N	\N
91	110	CDD	2024-12-29	\N	Actif	300000.00	2025-08-14 16:38:44.265	2025-09-03 10:13:03.561757	Administrateur réseaux	IT	\N	CONTRAT-91	Administrateur Système et Sécurité‚ réseau		\N	0.00	Salaire	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-29	\N	\N	\N
\.


--
-- TOC entry 5252 (class 0 OID 59308)
-- Dependencies: 248
-- Data for Name: depart_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.depart_history (id, employee_id, date_depart, motif_depart, type_depart, notes, created_at) FROM stdin;
\.


--
-- TOC entry 5224 (class 0 OID 33037)
-- Dependencies: 220
-- Data for Name: effectif; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.effectif (id, statut_dossier, matricule, nom_prenom, genre, date_naissance, age, age_restant, date_retraite, date_entree, lieu, adresse, telephone, email, cnss_number, cnamgs_number, poste_actuel, type_contrat, date_fin_contrat, employee_type, nationalite, functional_area, entity, responsable, statut_employe, statut_marital, enfants, niveau_etude, anciennete, specialisation, type_remuneration, payment_mode, categorie, salaire_base, salaire_net, prime_responsabilite, prime_penibilite, prime_logement, prime_transport, prime_anciennete, prime_enfant, prime_representation, prime_performance, prime_astreinte, honoraires, indemnite_stage, timemoto_id, password, emergency_contact, emergency_phone, last_login, password_initialized, first_login_date, created_at, updated_at) FROM stdin;
1	Dossier … completer		ABEGUE EDOU ABESSOLO Pauline	Femme	1987-02-19	38	22	2047-02-28	2025-01-01	Bessieux	\N	\N	\N			Agent d'accueil et facturation	CDD	2025-06-30	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	1	Niveau Bac	0 ans 3 mois		Salaire	virement cdl	5	123100.00	3000.00	\N	\N	\N	35000.00	\N	25000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 12:24:43.930428	2025-06-30 12:24:43.930428
3	Dossier … completer	\N	ADA ACKWE Myriam	Femme	1996-12-19	28	32	2056-12-31	2024-10-02	Bessieux			myriam.ada@centre-diagnostic.com	017-1604824-2	103-604-707-2	Assistante comptable	CDD	2025-07-01	Local	Gabon	Finance/Compta	CDL	chef comptable	Non-Cadre	C‚libataire	1	Bac+2/3	0 ans 6 mois		Salaire	virement cdl	6	131800.00	97000.00	0.00	0.00	0.00	35000.00	\N	\N	\N	\N	\N	0.00	0.00	\N	\N	\N	\N	\N	f	\N	2025-06-30 12:24:43.930428	2025-06-30 12:24:43.930428
4	Dossier complet		ADA MENZOGHE Ange Anicet	Homme	1972-05-03	52	8	2032-05-31	2024-08-12	Bessieux	\N	\N	\N	001-0477803-0	00-0477803-0	Coursier	CDD	2025-05-11	Local	Gabon	Direction G‚n‚rale	CDL	chef comptable	Non-Cadre	C‚libataire	2	Niveau ‚l‚mentaire	0 ans 8 mois	\N	Salaire	espŠces	3	112200.00	61720.00	\N	\N	\N	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 12:24:43.930428	2025-06-30 12:24:43.930428
5	Dossier … completer	\N	AFANGNIBO Agniodossi AgnŠs	Femme	1990-01-02	35	25	2050-01-31	2023-07-24	Bessieux			agnes.afangnibo@centre-diagnostic.com			Op‚rateur de saisie (  secr‚taire m‚dicale)	Prestataire	2025-09-23	expatri‚	Togo	Direction G‚n‚rale	CDL	M‚decin chef	Non-Cadre	C‚libataire	1	Niveau Bac	1 ans 8 mois		Honoraires	virement cdl		0.00	\N	0.00	0.00	0.00	0.00	\N	\N	\N	\N	\N	350000.00	0.00	\N	\N	\N	\N	\N	f	\N	2025-06-30 12:24:43.930428	2025-06-30 12:24:43.930428
6	Dossier … completer	\N	AKEWA DEGBOUEVI MARIUS	Homme	1974-01-19	51	9	2034-01-31	\N	Bessieux			marius.akewa@centre-diagnostic.com			VP-M‚decin r‚animateur anesthesiste	Prestataire	\N	Local	Gabon	Direction G‚n‚rale	CDL	Directeur G‚n‚ral	Cadre	Mari‚	0	Doctorat	125 ans 3 mois		Honoraires	virement cdl		0.00	\N	0.00	0.00	0.00	0.00	\N	\N	\N	\N	\N	750000.00	0.00	\N	\N	\N	\N	\N	f	\N	2025-06-30 12:24:43.930428	2025-06-30 12:24:43.930428
8	Doissier complet	\N	AKOUE Yvan Bertrand	Homme	1992-01-28	33	27	2052-01-31	2024-12-02	Bessieux	\N	\N	\N	001-1691946-5		Technicien superieur de biologie m‚dicale	CDD	2025-04-30	Local	Gabon	Laboratoire	CDL	responsable laboratoire	Non-Cadre	C‚libataire	0	Bac+2/3	0 ans 4 mois	\N	Salaire	virement cdl	7	153500.00	78611.00	\N	\N	\N	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 12:24:43.930428	2025-06-30 12:24:43.930428
9	Dossier complet	\N	ANAMPA TEGNI Franck SosthŠne	Homme	1993-07-06	31	29	2053-07-31	2022-11-01	Bessieux	\N	\N	\N	001-1644367-2	435-701-076-1	Technicien sup‚rieur en imagerie m‚dicale	CDI	\N	expatri‚	Cameroun	Clinique	CDL	P“le imagerie	Non-Cadre	C‚libataire	0	Bac+2/3	2 ans 5 mois	\N	Salaire	virement cdl	\N	568395.00	\N	\N	\N	\N	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 12:24:43.930428	2025-06-30 12:24:43.930428
10	Dossier … completer	\N	ANGA KABA Kitaba	Femme	1996-06-20	28	32	2056-06-30	2024-06-26	Bessieux	\N	\N	\N			M‚decin g‚n‚raliste	Prestataire	2025-06-25	Local	Gabon	Clinique	CDL	M‚decin chef	Cadre	C‚libataire	0	Doctorat	0 ans 9 mois	\N	Honoraires	espŠces	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 12:24:43.930428	2025-06-30 12:24:43.930428
11	Dossier … completer	\N	ANGONE EDOU Vasta	Femme	1991-08-30	33	27	2051-08-31	2024-10-21	Bessieux	\N	\N	\N			EquipiŠre polyvalente	CDD	2025-04-20	Local	Gabon	Wallya	CDL	Manager Healthcare	Non-Cadre	C‚libataire	0	… renseigner	0 ans 5 mois	\N	Salaire	virement cdl	5	123100.00	18577.00	\N	\N	\N	35000.00	\N	10000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 12:24:43.976977	2025-06-30 12:24:43.976977
12	Dossier complet		ANGOUE EYENE Junior Lebrun Chanfort	Homme	1994-06-24	30	30	2054-06-30	2024-04-22	Bessieux	\N	\N	\N			Infirmier(Šre)	Prestataire	2025-12-21	Local	Gabon	Clinique	CDL	InfirmiŠre Major	Non-Cadre	C‚libataire	0	Bac+2/3	0 ans 11 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	250000.00	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 12:24:43.976977	2025-06-30 12:24:43.976977
13	Dossier complet		ANGUE ELLA INES	Femme	1993-04-25	31	29	2053-04-30	2022-09-12	Bessieux	\N	\N	\N	016-1465255-5	935-137-837-6	Infirmier(Šre)	CDI	\N	Local	Gabon	Clinique	CDL	InfirmiŠre Major	Non-Cadre	C‚libataire	2	Niveau Bac	2 ans 7 mois	\N	Salaire	virement cdl	7	150000.00	30000.00	\N	\N	\N	35000.00	43000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 12:24:43.976977	2025-06-30 12:24:43.976977
14	Dossier complet	\N	AYITE KOKOUE St‚phanie Jacky	Femme	1992-11-29	32	28	2052-11-30	2025-01-28	Bessieux			stephanie.ayite@centre-diagnostic.com			InfirmiŠre	Prestataire	2025-06-27	Local	Gabon	Clinique	CDL	Cadre de sant‚	Non-Cadre	C‚libataire	0	Bac+3/4	0 ans 2 mois		Honoraires	virement cdl		0.00	\N	0.00	0.00	0.00	0.00	\N	\N	\N	\N	\N	0.00	0.00	\N	\N	\N	\N	\N	f	\N	2025-06-30 12:24:43.976977	2025-06-30 12:24:43.976977
15	Dossier … completer	\N	BADJINA MBOUMBA Ingrid	Femme	1992-10-13	32	28	2052-10-31	2024-08-27	Bessieux	\N	\N	\N	001-1680752-0	722-820-118-7	Agent d'accueil et facturation	CDD	2025-06-25	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	2	Bac+2/3	0 ans 7 mois	\N	Salaire	virement cdl	5	123100.00	5000.00	\N	\N	\N	35000.00	\N	25000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 12:24:43.976977	2025-06-30 12:24:43.976977
51	Dossier … completer	\N	HOUETO TAYE Jacques	Homme	1997-12-15	27	33	2057-12-31	2024-06-25	Bessieux	\N	\N	\N	\N	\N	Agent d'entretien	Prestataire	2025-06-24	expatri‚	B‚nin	Hotellerie/Hospitalit‚/Buanderie/Self	CDL	Responsable Accueil et Hospitalit‚	Non-Cadre	C‚libataire	0	Niveau ‚l‚mentaire	0 ans 9 mois	\N	Honoraires	espŠces	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	150000.00	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:29.786142	2025-06-30 17:16:29.786142
52	Dossier complet	\N	IBONDOU NZIENGUI Sylvanie	Femme	1981-10-06	43	17	2041-10-31	2024-04-02	Bessieux	\N	\N	\N	001-1106926-6	\N	Infirmier(Šre)	CDD	2025-10-01	Local	Gabon	Clinique	CDL	InfirmiŠre Major	Non-Cadre	Mari‚	3	Niveau ‚l‚mentaire	1 ans 0 mois	\N	Salaire	virement cdl	7	150000.00	41187.00	\N	\N	50000.00	35000.00	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:29.786142	2025-06-30 17:16:29.786142
53	Dossier … jour	\N	IFOUNGA IFOUNGA R‚ginalde	Femme	1991-08-03	33	27	2051-08-31	2022-10-01	Bessieux	\N	\N	\N	\N	\N	Technicien sup‚rieur de laboratoire	Prestataire	2025-09-10	Local	Gabon	Laboratoire	CDL	Responsable laboratoire	Non-Cadre	C‚libataire	0	Bac+2/3	2 ans 6 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:29.786142	2025-06-30 17:16:29.786142
54	Dossier complet	\N	IGOUHET YENO TATIANA VALERIE	Femme	1987-07-23	37	23	2047-07-31	2024-08-01	Bessieux	\N	\N	\N	\N	\N	CaissiŠre Principale	CDI	\N	Local	Gabon	Finance/Comptabilit‚	CDL	chef comptable	Non-Cadre	C‚libataire	1	Bac+4/5 - Ing‚nieur - Master	0 ans 8 mois	\N	Salaire	virement cdl	7	153500.00	75000.00	\N	\N	\N	35000.00	\N	\N	50000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:29.786142	2025-06-30 17:16:29.786142
55	Dossier complet	\N	KALUNGA BUBU BOY Daestee Charlotte	Femme	2000-04-22	24	36	2060-04-30	2024-08-27	Bessieux			charlotte.kalunga@centre-diagnostic.com	001-1680751-2		Agent d'Accueil et Administratif	CDD	2025-06-25	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	1	Bac+2/3	0 ans 7 mois		Salaire	virement cdl	5	123100.00	5000.00	0.00	0.00	0.00	35000.00	25000.00	\N	\N	\N	\N	0.00	0.00	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:29.786142	2025-06-30 17:16:29.786142
56	En formation	\N	KAMDEU TCHAMDEU AUDREY EMILIE	Femme	1996-07-23	28	32	2056-07-31	2022-12-15	Bessieux	\N	\N	\N	\N	\N	M‚decin G‚n‚raliste de garde	Prestataire	2025-06-25	expatri‚	Cameroun	Clinique	CDL	M‚decin chef	Cadre	C‚libataire	0	… renseigner	2 ans 4 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:29.786142	2025-06-30 17:16:29.786142
57	Dossier … completer	\N	KAYI Cl‚dys Flore	Femme	1981-08-23	43	17	2041-08-31	2023-10-14	Bessieux			cledys.kayi@centre-diagnostic.com			Agent call center	CDD	2025-10-31	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	2	Niveau Bac	1 ans 6 mois		Honoraires	virement cdl		0.00	\N	0.00	0.00	0.00	0.00	\N	\N	\N	\N	\N	150000.00	0.00	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:29.786142	2025-06-30 17:16:29.786142
58	Dossier complet	\N	KEMAYOU NANA Epse WANDJI DJOFANG Williane Nyna	Femme	1986-04-21	38	22	2046-04-30	2022-10-01	Bessieux	\N	\N	\N	\N	886-051-406-4	Infirmier(Šre) polyvalente ou cardio	Prestataire	2026-10-30	expatri‚	Cameroun	Clinique	CDL	InfirmiŠre Major	Non-Cadre	Mari‚	3	Bac+2/3	2 ans 6 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	250000.00	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:29.786142	2025-06-30 17:16:29.786142
59	Dossier complet	\N	KEMEGNE NOUMENI Cathy Carmen	Femme	1992-07-26	32	28	2052-07-31	2023-07-20	Bessieux	\N	\N	\N	\N	\N	Infirmier(Šre) gastro	Prestataire	2026-03-19	Local	Gabon	Laboratoire	CDL	InfirmiŠre Major	Non-Cadre	C‚libataire	0	Bac+2/3	1 ans 8 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	350000.00	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:29.786142	2025-06-30 17:16:29.786142
60	Dossier … completer	\N	KEMTCHOUANG SIMO Amyrel Karel	Femme	1997-06-25	27	33	2057-06-30	2024-06-26	Bessieux	\N	\N	\N	\N	\N	M‚decin g‚n‚raliste de garde	Prestataire	2025-06-25	expatri‚	Cameroun	Clinique	CDL	M‚decin chef	Cadre	C‚libataire	0	Doctorat	0 ans 9 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:29.786142	2025-06-30 17:16:29.786142
61	Dossier … completer	\N	KENGUE NDJIGHA SYLDANY	Femme	1992-05-30	32	28	2052-05-31	2024-02-14	Bessieux	\N	\N	\N	\N	\N	Infirmier(Šre)	Prestataire	2026-02-11	Local	Gabon	Clinique	CDL	InfirmiŠre Major	Non-Cadre	C‚libataire	0	Bac+2/3	1 ans 2 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	250000.00	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:49.546181	2025-06-30 17:16:49.546181
62	Dossier … completer	\N	KOGUET NZOUBA Amanda Falone	Femme	1987-05-17	37	23	2047-05-31	2024-10-01	Bessieux	\N	\N	\N	001-1628597-4	623-850-523-2	Assistante Dentaire	CDD	2025-09-30	Local	Gabon	Clinique	CDL	InfirmiŠre Major	Non-Cadre	C‚libataire	1	Bac+2/3	0 ans 6 mois	\N	Salaire	virement cdl	6	131800.00	100097.00	\N	\N	\N	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:49.546181	2025-06-30 17:16:49.546181
63	Dossier … completer	\N	KOMBA MAYOMBO Vivaldie	Femme	1992-03-19	33	27	2052-03-31	2024-08-27	Bessieux	\N	\N	\N	001-1683028-2	103-079-667-5	Agent d'accueil et facturation	CDD	2025-06-25	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	2	Niveau Bac	0 ans 7 mois	\N	Salaire	espŠces	5	123100.00	5000.00	\N	\N	\N	35000.00	\N	\N	25000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:49.546181	2025-06-30 17:16:49.546181
64	Dossier complet	\N	LAWAN Hadizatou	Femme	1990-01-30	35	25	2050-01-31	2023-02-27	Bessieux	\N	\N	\N	001-1606598-8	397-274-744-5	Infirmier(Šre)	CDI	\N	Local	Gabon	Clinique	CDL	InfirmiŠre Major	Non-Cadre	C‚libataire	0	Niveau secondaire	2 ans 1 mois	\N	Salaire	virement cdl	7	150000.00	30000.00	\N	\N	43000.00	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:49.546181	2025-06-30 17:16:49.546181
65	Dossier complet	\N	MAGONGA LEGNONGO CrŠse	Homme	1998-05-05	26	34	2058-05-31	2023-11-27	Bessieux	\N	\N	\N	001-1641495-4	\N	Cuisinier principal	CDD	2025-05-26	Local	Gabon	Hotellerie/Hospitalit‚/Buanderie/Self	CDL	Responsable Accueil et Hospitalit‚	Non-Cadre	C‚libataire	0	Niveau ‚l‚mentaire	1 ans 4 mois	\N	Salaire	virement cdl	\N	300000.00	\N	\N	\N	\N	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:49.546181	2025-06-30 17:16:49.546181
66	Dsossier … completer	\N	MAHINDZA SAFIOU Anzimath	Femme	1999-11-15	25	35	2059-11-30	2023-11-06	Bessieux	\N	\N	\N	\N	\N	Agent d'accueil et facturation	CDD	2025-05-05	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	0	Bac+2/3	1 ans 5 mois	\N	Salaire	virement cdl	5	123100.00	79100.00	\N	\N	\N	35000.00	\N	\N	25000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:49.546181	2025-06-30 17:16:49.546181
67	Dossier … completer	\N	MAKOUNE SOP Michele	Femme	1996-02-28	29	31	2056-02-29	2024-11-25	Bessieux	\N	\N	\N	\N	\N	Medecin g‚n‚raliste de garde	prestataire	2025-06-24	expatri‚	Cameroun	Clinique	CDL	M‚decin chef	Cadre	C‚libataire	1	Doctorat	0 ans 4 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:49.546181	2025-06-30 17:16:49.546181
68	Dossier complet	\N	MANDZA MAVOUNA Lucresse F‚randia	Femme	1995-04-16	30	30	2055-04-30	2025-02-03	Bessieux	\N	\N	\N	\N	\N	InfirmiŠre Assistante	CDD	2025-05-02	Local	Gabon	Clinique	CDL	cadre de sant‚	Non-Cadre	C‚libataire	0	Bac+2/3	0 ans 2 mois	\N	Salaire	virement cdl	5	123100.00	28000.00	\N	\N	\N	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:49.546181	2025-06-30 17:16:49.546181
69	Dossier complet	\N	MANSIR ELLA MichŠle	Femme	1993-03-05	32	28	2053-03-31	2023-11-21	Bessieux			michelle.mansir@centre-diagnostic.com	001-1658729-6	143-668-016-7	M‚decin G‚n‚raliste	CDD	2025-11-21	Local	Gabon	Clinique	CDL	M‚decin chef	Cadre	C‚libataire	1	Doctorat	1 ans 4 mois		Salaire	virement cdl		250000.00	250000.00	0.00	0.00	0.00	35000.00	165000.00	\N	\N	\N	\N	0.00	0.00	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:49.546181	2025-06-30 17:16:49.546181
70	Dossier … completer	\N	MATAMBA NDEMBET Felie Reine Epse MBOUMBA	Femme	1992-10-30	32	28	2052-10-31	2023-11-07	Bessieux			felie.matamba@centre-diagnostic.com	016-1468723-3		Secr‚taire m‚dicale	CDD	2025-11-06	Local	Gabon	Laboratoire	CDL	M‚decin chef	Non-Cadre	Mari‚	0	Bac+2/3	1 ans 5 mois		Salaire	virement cdl	AM1	194600.00	85400.00	0.00	0.00	35000.00	35000.00	\N	\N	\N	\N	\N	0.00	0.00	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:16:49.546181	2025-06-30 17:16:49.546181
71	Dossier complet	\N	MATOUNGOU KOMBA Blandine	Femme	1997-06-03	27	33	2057-06-30	2024-04-03	Bessieux	\N	\N	\N	001-1633155-4	428-742-591-8	Technicien sup‚rieur de laboratoire	CDI	\N	Local	Gabon	Laboratoire	CDL	Responsable laboratoire	Non-Cadre	C‚libataire	0	Bac+2/3	1 ans 0 mois	\N	Salaire	virement cdl	\N	300000.00	\N	\N	\N	35330.00	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:17:45.322112	2025-06-30 17:17:45.322112
72	Dossier complet	\N	MATSANGA FATOMBI Waridath	Femme	1997-05-01	27	33	2057-05-31	2025-01-30	Bessieux	\N	\N	\N	\N	\N	InfirmiŠre	prestataire	2025-07-29	Local	Gabon	Clinique	CDL	cadre de sant‚	Non-Cadre	C‚libataire	0	Niveau Bac	0 ans 2 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	250000.00	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:17:45.322112	2025-06-30 17:17:45.322112
73	Dossier … completer	\N	MAZAMBA Loic ThystŠre	Homme	1992-08-20	32	28	2052-08-31	2025-01-01	Bessieux			loic.mazamba@centre-diagnostic.com			M‚decin g‚n‚raliste	CDI	2025-06-30	Local	Gabon	Clinique	CDL		Cadre	C‚libataire	0	Doctorat	0 ans 3 mois		Honoraires	virement cdl		0.00	\N	0.00	0.00	0.00	0.00	\N	\N	\N	\N	\N	1000000.00	0.00	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:17:45.322112	2025-06-30 17:17:45.322112
74	Dossier … completer	\N	MBA MEZUI EDOUARD	Homme	1990-03-17	35	25	2050-03-31	2024-01-12	Bessieux	\N	\N	\N	\N	\N	Agent d'entretien	Prestataire	2025-06-30	Local	Gabon	Hotellerie/Hospitalit‚/Buanderie/Self	CDL	Responsable Accueil et Hospitalit‚	Non-Cadre	C‚libataire	0	Niveau ‚l‚mentaire	1 ans 3 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	150000.00	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:17:45.322112	2025-06-30 17:17:45.322112
75	Dossier … completer	\N	MBADINGA MBADINGA Dave ArsŠne	Homme	1993-12-12	31	29	2053-12-31	2023-09-18	Bessieux	\N	\N	\N	\N	330-312-928-9	Infirmier(Šre) assistant(e)	Prestataire	2025-10-31	Local	Gabon	Clinique	CDL	InfirmiŠre Major	Non-Cadre	C‚libataire	0	Bac+2/3	1 ans 6 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	250000.00	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:17:45.322112	2025-06-30 17:17:45.322112
76	Dossier complet	\N	MBADINGA MICKALA STESSY	Homme	1995-08-30	29	31	2055-08-31	2024-12-16	Bessieux	\N	\N	\N			Brancardier	CDD	2025-06-15	Local	Gabon	Clinique	CDL	M‚decin chef	Non-Cadre	C‚libataire	0	Niveau Bac	0 ans 4 mois		Honoraires	virement cdl		0.00	\N	0.00	0.00	0.00	0.00	\N	\N	\N	\N	\N	150000.00	0.00	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:17:45.322112	2025-06-30 17:17:45.322112
77	Dossier complet	\N	MBENGUE MANDZEYI Rosette Floria	Femme	2002-09-24	22	38	2062-09-30	2024-12-20	Bessieux						Stagiaire infirmiŠre polyvalente	stage PNPE	2025-06-19	Local	Gabon	Clinique	CDL	InfirmiŠre Major	Non-Cadre	C‚libataire	0	Bac+2/3	0 ans 3 mois		Indemnit‚ de Stage	espŠces		0.00	\N	0.00	0.00	0.00	0.00	\N	\N	\N	\N	\N	0.00	180000.00	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:17:45.322112	2025-06-30 17:17:45.322112
78	Dossier complet	\N	MBIA NDZALE Bertancia Ruth Cindy	Femme	1998-10-31	26	34	2058-10-31	2025-01-02	Bessieux	\N	\N	\N	001-1688656-5	677-578-811-8	InfirmiŠre	CDD	2025-06-30	Local	Gabon	Clinique	CDL	InfirmiŠre Major	Non-Cadre	C‚libataire	0	Bac+2/3	0 ans 3 mois	\N	Salaire	virement cdl	7	153500.00	75000.00	\N	\N	\N	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-06-30 17:17:45.322112	2025-06-30 17:17:45.322112
\.


--
-- TOC entry 5228 (class 0 OID 41217)
-- Dependencies: 224
-- Data for Name: employee_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_documents (id, employee_id, document_type, file_name, file_path, upload_date) FROM stdin;
\.


--
-- TOC entry 5264 (class 0 OID 67497)
-- Dependencies: 260
-- Data for Name: employee_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_notifications (id, employee_id, title, message, type, related_id, related_type, is_read, created_at, read_at) FROM stdin;
\.


--
-- TOC entry 5242 (class 0 OID 41345)
-- Dependencies: 238
-- Data for Name: employee_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_requests (id, employee_id, request_type, request_details, start_date, end_date, reason, status, request_date, response_date, response_comments, start_time, end_time) FROM stdin;
5	64	document_request	Attestation de travail	\N	\N	Demande d'attestation pour démarches administratives	pending	2025-09-05 14:41:09.112626	\N	\N	\N	\N
6	51	document_request	Attestation de travail	\N	\N	Demande d'attestation pour démarches administratives	pending	2025-09-05 14:44:24.103144	\N	\N	\N	\N
7	154	leave_request	Congé annuel	2025-01-15	2025-01-20	Congé annuel pour repos familial	pending	2025-09-05 14:44:28.188806	\N	\N	\N	\N
8	107	leave_request	Congé annuel	\N	\N	Demande de congé pour repos familial	pending	2025-09-05 14:45:17.592782	\N	\N	\N	\N
9	116	leave_request	Congé annuel	\N	\N	Demande de congé pour repos familial	pending	2025-09-05 14:45:55.088394	\N	\N	\N	\N
10	73	leave_request	Congé annuel	\N	\N	Congé annuel pour repos familial	pending	2025-09-05 14:46:29.952179	\N	\N	\N	\N
11	17	absence	Absence médicale	\N	\N	Consultation médicale	pending	2025-09-05 14:46:29.957443	\N	\N	\N	\N
12	139	document_request	Attestation de travail	\N	\N	Démarches administratives	pending	2025-09-05 14:46:29.959801	\N	\N	\N	\N
13	185	leave_request	Congé maladie	\N	\N	Arrêt maladie prescrit par le médecin	pending	2025-09-05 14:46:29.961343	\N	\N	\N	\N
14	160	absence	Absence personnelle	\N	\N	Rendez-vous personnel important	pending	2025-09-05 14:46:29.963728	\N	\N	\N	\N
15	156	absence	Absence médicale	2025-01-10	2025-01-12	Consultation médicale et examens	pending	2025-09-05 14:48:55.357099	\N	\N	\N	\N
16	124	leave		2025-09-08	2025-09-10	Maladie	pending	2025-09-05 15:04:11.540719	\N	\N	\N	\N
17	124	other		\N	\N	Problème technique	approved	2025-09-05 15:16:59.498133	2025-09-06 09:34:13.828687		\N	\N
\.


--
-- TOC entry 5226 (class 0 OID 33073)
-- Dependencies: 222
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, statut_dossier, matricule, nom_prenom, genre, date_naissance, age, age_restant, date_retraite, date_entree, lieu, adresse, telephone, email, cnss_number, cnamgs_number, poste_actuel, type_contrat, date_fin_contrat, employee_type, nationalite, functional_area, entity, responsable, statut_employe, statut_marital, enfants, niveau_etude, anciennete, specialisation, type_remuneration, payment_mode, categorie, salaire_base, salaire_net, prime_responsabilite, prime_penibilite, prime_logement, prime_transport, prime_anciennete, prime_enfant, prime_representation, prime_performance, prime_astreinte, honoraires, indemnite_stage, timemoto_id, password, emergency_contact, emergency_phone, last_login, password_initialized, first_login_date, created_at, updated_at, departement, domaine_fonctionnel, statut, date_depart, contact_urgence, telephone_urgence, mode_paiement, photo_path) FROM stdin;
200	\N	ADMIN-001	Admin RH	\N	\N	\N	\N	\N	2023-01-01	\N	\N	\N	rh@centre-diagnostic.com	\N	\N	Administrateur RH	\N	\N	\N	\N	RH	\N	\N	Actif	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-09-06 08:40:58.319726	2025-09-06 08:45:23.878473			Actif	\N	\N	\N	\N	\N
5	\N	CDL-2023-0004	AFANGNIBO Agniodossi Agnès	Femme	1990-01-01	35	30	2055-01-01	2023-07-23	Bessieux			agnes.afangnibo@centre-diagnostic.com			Sécrétaire médicale	Prestataire	2025-09-22	expatri‚	Togo	Direction G‚n‚rale	CDL	M‚decin chef	\N	C‚libataire	1	Niveau Bac	2 ans 0 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	350000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:01:20.74689	2025-08-13 13:57:37.049712			Actif	\N	\N	\N	\N	\N
8	\N	CDL-2024-0006	AKOUE Yvan Bertrand	Homme	1992-01-27	33	32	2057-01-27	2024-12-01	Bessieux				001-1691946-5		Technicien supérieur de biologie médicale	CDD	2025-04-29	Local	Gabon	Laboratoire	CDL	responsable laboratoire	\N	C‚libataire	0	Bac+2/3	0 ans 8 mois		Salaire	virement cdl	7	153500.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:01:20.74689	2025-08-13 13:58:42.487486			Actif	\N	\N	\N	\N	\N
201	\N	\N	herve mboumba	Homme	1986-07-23	\N	\N	\N	2025-09-15	Libreville	Nzeng Ayong	+24174027173	rh@centre-diagnostic.com	001-1072354-1	00-0477803-0	Assistante rh	CDD	2025-12-14	Local	Gabon	Clinique	CDL	\N	\N	Célibataire	0	Bac+3/4	\N	Maître II	Salaire	virement cdl	6	400000.00	\N	0.00	\N	0.00	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-09-20 11:37:50.273347	2025-09-20 11:37:50.273347			Actif	\N	\N	\N	\N	/uploads/photos/employee-photo-1758368270191-324936007.jpg
9	\N	CDL-2022-0007	ANAMPA TEGNI Franck Sosthène	Homme	1993-07-05	32	33	2058-07-05	2022-10-31	Bessieux				001-1644367-2	435-701-076-1	Technicien supérieur en imagerie médicale	CDI	\N	expatri‚	Cameroun	Clinique	CDL	P“le imagerie	\N	C‚libataire	0	Bac+2/3	2 ans 9 mois		Salaire	Virement bancaire		568395.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:01:20.74689	2025-08-13 14:01:48.787851			Actif	\N	\N	\N	\N	\N
22	Dossier … completer	CDL-2021-0020	BIYEYEME NKYE Anais Keshya	Femme	1992-07-26	32	28	2052-07-31	2021-10-01	Bessieux			anais.biyeyeme@centre-diagnostic.com	015-1383061-1		Responsable Cotation	CDI	\N	Local	Gabon	Direction G‚n‚rale	CDL	Finance/Comptabilit‚	Non-Cadre	C‚libataire	0	… renseigner	3 ans 6 mois		Salaire	virement cdl	7	157094.00	\N	0.00	0.00	0.00	35000.00	100000.00	\N	115000.00	\N	\N	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:03.442634	2025-06-30 17:15:03.442634			Actif	\N	\N	\N	\N	\N
120	\N	CDL-2022-0102	NGUEMBIT NGUEMBIT Mayité	Femme	1983-08-23	41	24	2048-08-23	2022-03-10	Bessieux				001-1111969-9		Infirmier(ère) assistant(e)	CDI	\N	Local	Gabon	Clinique	CDL	InfirmiÈre Major	\N	C‚libataire	3	Bac+2/3	3 ans 5 mois		Salaire	virement cdl		200000.00	0.00	0.00	0.00	0.00	40000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:46.910981	2025-08-13 14:51:22.819063			Actif	\N	\N	\N	\N	\N
184	\N	CDL-2025-0151	NIANGUI MBIKA Charmélia	Femme	2001-10-19	23	42	2066-10-19	2025-06-09	Libreville				180-163-390-7		Stagiaire Infirmière	stage PNPE	2025-12-08	Local	Gabon	Clinique	CDL	cadre de sant‚	\N	C‚libataire	0	Bac+2/3	0 ans 2 mois		Indemnit‚ de Stage	Virement CDL		0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:12:55.622527	2025-08-13 14:52:31.223619			Actif	\N	\N	\N	\N	\N
53	\N	CDL-2022-0048	IFOUNGA IFOUNGA Réginalde	Femme	1991-08-02	34	31	2056-08-02	2022-09-30	Bessieux						Technicien supérieur de laboratoire	Prestataire	2025-09-09	Local	Gabon	Laboratoire	CDL	Responsable laboratoire	\N	C‚libataire	0	Bac+2/3	2 ans 10 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:24:49.537174	2025-08-13 14:26:00.84636			Actif	\N	\N	\N	\N	\N
146	\N	CDL-2025-0121	OGALLA Jissica	Femme	1995-04-03	30	35	2060-04-03	2025-02-04	Bessieux			jissica.ogalla@centre-diagnostic.com			Infirmière Assistante	CDD	2025-05-03	Local	Gabon	Clinique	CDL	Cadre de sant‚	\N	C‚libataire	1	Niveau Bac	0 ans 6 mois		Salaire	virement cdl	5	123100.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:00.40689	2025-08-13 15:00:58.961364			Actif	\N	\N	\N	\N	\N
168	\N	CDL-2023-0141	UZODIMMA CHIOMA GRACE	Femme	1997-08-30	27	38	2062-08-30	2023-04-02	Bessieux			chioma.uzodimma@centre-diagnostic.com			Secrétaire médicale imagérie	Prestataire	2025-10-29	expatri‚	Nig‚ria	Clinique	CDL	P“le imagerie	\N	C‚libataire	0	Niveau Bac	2 ans 4 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	250000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-08-13 15:09:45.821357			Actif	\N	\N	\N	\N	\N
169	\N	CDL-2022-0142	VENGA ENGO Nancy	Femme	1993-07-01	32	33	2058-07-01	2022-08-31	Besssieux				001-1600630-5	428-742-195-8	Infirmier(ère) Major	CDI	\N	Local	Gabon	Clinique	CDL	M‚decin chef	\N	Mari‚	2	Bac+2/3	2 ans 11 mois	InfimiÈre	Salaire	virement cdl	7	150000.00	0.00	100000.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-08-13 15:10:02.659175			Actif	\N	\N	\N	\N	\N
162	\N	CDL-2024-0136	SAVY ENAGNON Epse AKOHOUENDO	Femme	1978-09-02	46	19	2043-09-02	2024-11-19	Bessieux						Tecnicienne superieur de biologie médicale	prestataire	2025-05-18	expatri‚	B‚nin	Laboratoire	CDL	Responsable laboratoire	\N	Mari‚	0	Bac+2/3	0 ans 8 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	500000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-08-13 15:06:48.038131			Actif	\N	\N	\N	\N	\N
163	\N	CDL-2024-0137	SOL YOHI EPIPHANIE LAURE	Femme	1991-12-31	33	32	2056-12-31	2024-02-29	Bessieux						Infirmier(ère) assistant(e)	Prestataire	2025-06-29	expatri‚	Cameroun	Clinique	CDL	InfirmiÈre Major	\N	C‚libataire	0	Bac+2/3	1 ans 5 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	250000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-08-13 15:07:46.178825			Actif	\N	\N	\N	\N	\N
6	\N	CDL-2024-0005	AKEWA DEGBOUEVI MARIUS	Homme	1974-01-17	51	14	2039-01-17	\N	Bessieux			marius.akewa@centre-diagnostic.com			VP-Médecin réanimateur anesthésiste	Prestataire	\N	Local	Gabon	Direction G‚n‚rale	CDL	Directeur G‚n‚ral	\N	Mari‚	0	Doctorat	\N		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	750000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:01:20.74689	2025-08-14 15:41:31.919547			Actif	\N	\N	\N	\N	\N
1	\N	CDL-2025-0001	ABEGUE EDOU ABESSOLO Pauline	Femme	1987-02-18	38	27	2052-02-18	2024-12-31	Bessieux						Agent d'accueil et facturation	CDD	2025-06-29	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	\N	C‚libataire	1	Niveau Bac	0 ans 7 mois		Salaire	Virement bancaire	5	123100.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:01:20.74689	2025-08-13 13:52:33.382405			Actif	\N	\N	\N	\N	\N
3	\N	CDL-2024-0002	ADA ACKWE Myriam	Femme	1996-12-18	28	37	2061-12-18	2024-10-01	Bessieux			myriam.ada@centre-diagnostic.com	017-1604824-2	103-604-707-2	Assistante comptable	CDD	2025-06-30	Local	Gabon	Finance/Compta	CDL	chef comptable	\N	C‚libataire	1	Bac+2/3	0 ans 10 mois		Salaire	Virement bancaire	6	131800.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:01:20.74689	2025-08-13 13:54:09.203462			Actif	\N	\N	\N	\N	\N
4	\N	CDL-2024-0003	ADA MENZOGHE Ange Anicet	Homme	1972-05-02	53	12	2037-05-02	2024-08-11	Bessieux				001-0477803-0	00-0477803-0	Coursier	CDD	2025-05-10	Local	Gabon	Direction G‚n‚rale	CDL	chef comptable	\N	C‚libataire	2	Niveau ‚l‚mentaire	1 ans 0 mois		Salaire	espŠces	3	112200.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:01:20.74689	2025-09-03 12:22:20.606			Parti	2025-09-03	\N	\N	\N	\N
10	\N	CDL-2024-0008	ANGA KABA Kitaba	Femme	1996-06-19	29	36	2061-06-19	2024-06-25	Bessieux						Médecin généraliste	Prestataire	2025-06-24	Local	Gabon	Clinique	CDL	M‚decin chef	\N	C‚libataire	0	Doctorat	1 ans 1 mois		Honoraires	espŠces		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:01:20.74689	2025-08-13 14:02:57.14926			Actif	\N	\N	\N	\N	\N
19	\N	CDL-2024-0017	BELLA NKOGHE Ep OBAME MBA JORINI CHANCIA	Femme	1986-01-17	39	26	2051-01-17	2024-02-21	Bessieux			bella.nkoghe@centre-diagnostic.com	001-1094020-2	001-1094020-2	Secrétaire médicale	CDI	\N	Local	Gabon	Clinique	CDL	M‚decin chef	\N	Mari‚	3	Bac+2/3	1 ans 5 mois		Salaire	virement cdl		210000.00	0.00	0.00	0.00	75000.00	45000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 16:59:53.13335	2025-08-13 14:07:43.168512			Actif	\N	\N	\N	\N	\N
20	\N	CDL-2022-0018	BIKANGA Bev Rivialea	Femme	1996-07-26	29	36	2061-07-26	2022-02-28	Bessieux						Médecin Généraliste de garde	Prestataire	2025-02-27	Local	Gabon	Clinique	CDL	M‚decin chef	\N	C‚libataire	0	… renseigner	3 ans 5 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 16:59:53.13335	2025-08-13 14:08:28.055169			Actif	\N	\N	\N	\N	\N
57	\N	CDL-2023-0052	KAYI Clédys Flore	Femme	1981-08-22	43	22	2046-08-22	2023-10-13	Bessieux			cledys.kayi@centre-diagnostic.com			Agent call center	CDD	2025-10-30	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	\N	C‚libataire	2	Niveau Bac	1 ans 10 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	150000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:24:49.537174	2025-08-13 14:28:13.78932			Actif	\N	\N	\N	\N	\N
17	Dossier complet	CDL-2023-0015	BAYACKABOMA BIAMALONGO Petula Clarick	Femme	1986-09-12	38	22	2046-09-30	2023-02-01	Bessieux	\N	\N	\N	011-282517-7	229-311-654-5	Infirmier(Šre)	CDI	\N	Local	Gabon	Clinique	CDL	InfirmiŠre Major	Non-Cadre	C‚libataire	3	Bac+2/3	2 ans 2 mois	\N	Salaire	virement cdl	7	150000.00	30000.00	\N	\N	\N	35000.00	44000.00	\N	\N	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 16:59:53.13335	2025-06-30 16:59:53.13335			Actif	\N	\N	\N	\N	\N
18	Dossier … completer	CDL-2023-0016	BEKALE HARB Saleh Curtis	Homme	1999-02-10	26	34	2059-02-28	2023-09-18	Bessieux	\N	\N	\N	001-1670034-5	\N	Agent d'accueil et facturation	CDD	2025-07-31	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	0	Bac+2/3	1 ans 6 mois	\N	Salaire	virement cdl	7	150000.00	30000.00	\N	\N	\N	35000.00	12000.00	\N	\N	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 16:59:53.13335	2025-06-30 16:59:53.13335			Actif	\N	\N	\N	\N	\N
16	\N	CDL-2021-0014	BARRIER Nadia Stéphanie	Femme	1980-05-05	45	20	2045-05-05	2021-06-15	Bessieux						Biologiste	Prestataire	2025-06-12	Local	Gabon	Laboratoire	CDL	Responsable laboratoire	\N	C‚libataire	0	Bac+4/5 - Ing‚nieur - Master	4 ans 2 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	500000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 16:59:53.13335	2025-08-13 14:08:58.730797			Actif	\N	\N	\N	\N	\N
21	\N	CDL-2024-0019	BIVIGOU DICKOBOU	Femme	1991-12-06	33	32	2056-12-06	2024-12-07	Bessieux			bivigou.dickobou@centre-diagnostic.com	016-1417390-0		Secrétaire médicale	CDD	2025-09-06	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	\N	C‚libataire	1	… renseigner	0 ans 8 mois		Salaire	virement cdl	6	131800.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:03.442634	2025-08-13 14:11:09.048907			Actif	\N	\N	\N	\N	\N
51	Dossier … completer	CDL-2024-0046	HOUETO TAYE Jacques	Homme	1997-12-15	27	33	2057-12-31	2024-06-25	Bessieux	\N	\N	\N	\N	\N	Agent d'entretien	Prestataire	2025-06-24	expatri‚	B‚nin	Hotellerie/Hospitalit‚/Buanderie/Self	CDL	Responsable Accueil et Hospitalit‚	Non-Cadre	C‚libataire	0	Niveau ‚l‚mentaire	0 ans 9 mois	\N	Honoraires	espŠces	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	150000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:24:49.537174	2025-07-01 07:24:49.537174			Actif	\N	\N	\N	\N	\N
122	\N	CDL-2024-0104	NKOGHO ETOUGHE BIYOGHE Johan	Homme	1997-12-30	27	38	2062-12-30	2024-10-12	Libreville	Akanda	+24174244291	johan.nkoghoetoughe@centre-diagnostic.com			Developpeur full stack	CDD	2025-11-05		Gabon	Informatique	CDL/IT		\N	Célibataire	0		0 ans 10 mois		Salaire	Virement bancaire	Non-Cadre	450000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:08:26.652552	2025-08-13 13:43:16.089896			Actif	\N	\N	\N	\N	\N
24	Dossier complet	CDL-2023-0022	BOUNGOUERE MABE C‚phora	Femme	1995-10-24	29	31	2055-10-31	2023-07-01	Bessieux	\N	\N	\N	001-1644365-6	108-676-249-5	Agent d'accueil et facturation	CDI	\N	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	1	Bac+2/3	1 ans 9 mois	\N	Salaire	virement cdl	7	150000.00	30000.00	\N	\N	\N	35000.00	12000.00	\N	40000.00	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:03.442634	2025-06-30 17:15:03.442634			Actif	\N	\N	\N	\N	\N
25	\N	CDL-2025-0023	BOUSSIENGUI LISSOUMOU Milène Darcy	Femme	1993-03-13	32	33	2058-03-13	2025-02-19	Bessieux						Équipière polyvalente	CDD	2025-05-18	Local	Gabon	Wallya	CDL	Manager Healthcare	\N	C‚libataire	1	Bac+2/3	0 ans 5 mois		Salaire	Virement bancaire	4	117600.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:03.442634	2025-08-13 14:12:17.472412			Actif	\N	\N	\N	\N	\N
26	Dossier complet	CDL-2022-0024	BOUSSOUGOU AHIAKPOR Yao Samson	Homme	1988-04-07	37	23	2048-04-30	2022-10-01	Bessieux	\N	\N	\N	001-1614453-6	\N	Agent d'accueil et facturation	CDI	\N	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	0	Bac+2/3	2 ans 6 mois	\N	Salaire	virement cdl	7	150000.00	30000.00	\N	\N	\N	\N	11700.00	\N	13300.00	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:03.442634	2025-06-30 17:15:03.442634			Actif	\N	\N	\N	\N	\N
33	\N	CDL-2024-0030	DIVEMBA BOUKA Lodie Espérance	Femme	1988-11-14	36	29	2053-11-14	2024-08-26	Bessieux				001-1683238-7	359-842-829-6	Agent d'accueil et facturation	CDD	2025-06-24	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	\N	C‚libataire	1	Bac+4/5 - Ing‚nieur - Master	0 ans 11 mois		Salaire	Virement bancaire	5	123100.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:21.842587	2025-08-13 14:14:20.930038			Actif	\N	\N	\N	\N	\N
30	Dossier complet	CDL-2023-0027	DEKPE KOMLAN ETEBA	Homme	1969-05-13	55	5	2029-05-31	2023-02-21	Bessieux	\N	\N	\N	\N	\N	Infirmier(Šre)	Prestataire	2025-02-19	expatri‚	Togo	Clinique	CDL	InfirmiŠre Major	Non-Cadre	C‚libataire	0	Niveau Bac	2 ans 1 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	450000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:03.442634	2025-06-30 17:15:03.442634			Actif	\N	\N	\N	\N	\N
31	Dossier … completer	CDL-2021-0028	DIBOUNGA Diane	Femme	1991-03-30	34	26	2051-03-31	2021-12-09	Bessieux			diane.dibounga@centre-diagnostic.com	001-1282516-6	861-693-520-6	Assistance de Direction	CDI	\N	Local	Gabon	Direction G‚n‚rale	CDL	Directeur G‚n‚ral	Non-Cadre	C‚libataire	4	Bac+4/5 - Ing‚nieur - Master	3 ans 4 mois	S‚cretaire m‚dicale	Salaire	virement cdl		200000.00	120000.00	0.00	0.00	120000.00	35000.00	60000.00	\N	\N	\N	\N	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:21.842587	2025-06-30 17:15:21.842587			Actif	\N	\N	\N	\N	\N
32	Dossier complet pour passage en CDD	CDL-2025-0029	DISSIYA DOLERA Mistral	Femme	1990-08-15	34	26	2050-08-31	2025-01-01	Bessieux	\N	\N	\N	\N	\N	Agent d'accueil et facturation	CDD	2025-06-30	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	0	… renseigner	0 ans 3 mois	\N	Honoraires	espŠces	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	180000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:21.842587	2025-06-30 17:15:21.842587			Actif	\N	\N	\N	\N	\N
34	\N	CDL-2023-0031	DJIEUKAM TOKO Danielle	Femme	1987-01-08	38	27	2052-01-08	2023-11-14	Bessieux			danielle.djieukam@centre-diagnostic.com	001-1673696-6		Médecin gastro-entérologue	CDD	2025-05-01	expatri‚	Cameroun	Clinique	CDL	M‚decin chef	\N	C‚libataire	2	Doctorat	1 ans 9 mois	Dipl“me gastro-enterologue	Salaire	chŠque	HC	1500000.00	0.00	0.00	0.00	360000.00	300000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:21.842587	2025-08-13 14:15:21.200803			Actif	\N	\N	\N	\N	\N
35	\N	CDL-2024-0032	DOGOUI Epse M'BOUMBA Hervé Bénédicte	Femme	1983-10-17	41	24	2048-10-17	2024-10-01	Bessieux			herve.dogoui@centre-diagnostic.com			Agent de saisie et cotation	CDD	2025-06-30	Local	Gabon	Cotation	CDL	Chef comptable	\N	Mari‚	2	Bac+2/3	0 ans 10 mois		Salaire	Virement bancaire	5	123100.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:21.842587	2025-08-13 14:16:33.158098			Actif	\N	\N	\N	\N	\N
41	\N	CDL-2024-0037	EMANE NGUIE Gwenaelle Sthessy	Homme	1996-01-18	29	36	2061-01-18	2024-09-01	Libreville	Nzeng Ayong	077032117	gwenaelle.emane@centre-diagnostic.com			Assistante rh	CDD	2025-08-30		Gabon	RH	CDL		\N	Célibataire	1		0 ans 11 mois		Salaire	Virement bancaire		350000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:42.530236	2025-08-13 14:19:43.175714			Actif	\N	\N	\N	\N	\N
37	Dossier … completer	CDL-2021-0033	DOSSEH SEWAVI Gustave	Homme	1966-09-19	58	2	2026-09-30	2021-10-01	Bessieux	\N	\N	\N	\N	\N	Biologiste	Prestataire	2025-03-30	Local	Gabon	Clinique	CDL	Responsable laboratoire	Non-Cadre	C‚libataire	0	Bac+2/3	3 ans 6 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	250000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:21.842587	2025-06-30 17:15:21.842587			Actif	\N	\N	\N	\N	\N
38	Dossier complet; en attente de CDD	CDL-2024-0034	DOUTSONA BOUASSA Evy Ornella Femiche	Femme	1994-04-25	30	30	2054-04-30	2024-06-01	Bessieux	\N	\N	\N	\N	722-828-406-5	Sage-femme	CDD	2025-07-31	Local	Gabon	Clinique	CDL	M‚decin Gyn‚cologue	Non-Cadre	C‚libataire	1	Bac+2/3	0 ans 10 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	200000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:21.842587	2025-06-30 17:15:21.842587			Actif	\N	\N	\N	\N	\N
39	Dossier … completer pour passage en CDD	CDL-2025-0035	DOUTSONA M'FOUMBI Loraine Merlik	Femme	1993-07-18	31	29	2053-07-31	2025-01-01	Bessieux	\N	\N	\N	\N	\N	Agent d'accueil et facturation	CDD	2025-06-30	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	1	Niveau Bac	0 ans 3 mois	\N	Salaire	virement cdl	5	123100.00	3000.00	\N	\N	\N	35000.00	\N	\N	25000.00	\N	\N	180000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:21.842587	2025-06-30 17:15:21.842587			Actif	\N	\N	\N	\N	\N
69	\N	CDL-2023-0064	MANSIR ELLA Michèle	Femme	1993-03-04	32	33	2058-03-04	2023-11-20	Bessieux			michelle.mansir@centre-diagnostic.com	001-1658729-6	143-668-016-7	Médecin Généraliste	CDD	2025-11-20	Local	Gabon	Clinique	CDL	M‚decin chef	\N	C‚libataire	1	Doctorat	1 ans 8 mois		Salaire	virement cdl		250000.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:25:01.569519	2025-08-13 14:34:16.350779			Actif	\N	\N	\N	\N	\N
124	\N	CDL-2024-0105	NKOMA TCHIKA Paule Winnya	Femme	1992-03-21	33	32	2057-03-21	2024-07-17	Libreville	Nzeng Ayong	074027173	paule.winnya@centre-diagnostic.com	001-1072354-1		Assistante projet IT & Developpeuse	CDD	2026-07-30	Local	Gabonaise	Informatique	CDL/IT	Yohann OLYMPIO	\N	Célibataire	0	Bac+4	1 ans 0 mois	Ingénieurie logiciel	Salaire	Virement bancaire	Non-Cadre	153000.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:08:26.652552	2025-08-13 13:32:01.00623			Actif	\N	\N	\N	\N	\N
27	\N	CDL-2022-0025	CHITOU Bilkis Epse SANMA Folachad‚ Amakè	Femme	1992-08-10	33	32	2057-08-10	2022-10-31	Bessieux			bilkis.chitou@centre-diagnostic.com	001-1642345-0		Médecin gynécologue	CDI	\N	expatri‚	B‚nin	Clinique	CDL	M‚decin chef	\N	Mari‚	2	Doctorat	2 ans 9 mois	Dipl“me gyn‚cologie	Salaire	virement cdl	HC	1500000.00	0.00	500000.00	0.00	450000.00	200000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:03.442634	2025-08-13 14:13:17.980744			Actif	\N	\N	\N	\N	\N
45	\N	CDL-2024-0041	FANGUINOVENY OLYMPIO Yohann Delah	Homme	1978-03-08	47	18	2043-03-08	2024-08-31	Bessieux						Chargé de la Formation	CDD	2025-06-29	Local	Gabon	Clinique	CDL	Directeur G‚n‚ral	\N	C‚libataire	3	… renseigner	0 ans 11 mois		Salaire	Virement bancaire	AM1	194600.00	0.00	50000.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:42.530236	2025-08-13 14:21:56.450474			Actif	\N	\N	\N	\N	\N
42	Dossier complet	CDL-2023-0038	EMVO BARRO Lanslow Abou	Homme	1998-02-21	27	33	2058-02-28	2023-09-18	Bessieux	\N	\N	\N	001-1683237-9	\N	Agent d'accueil et facturation	CDD	2025-04-30	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	0	Bac+2/3	1 ans 6 mois	\N	Salaire	virement cdl	7	150000.00	30000.00	\N	\N	\N	35000.00	12000.00	\N	40000.00	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:42.530236	2025-06-30 17:15:42.530236			Actif	\N	\N	\N	\N	\N
43	Dossier … completer	CDL-2023-0039	EYA FIRMIN	Homme	\N	125	-65	1960-01-31	2023-04-06	Bessieux	\N	\N	\N	\N	\N	Technicien Endoscopie	Prestataire	\N	Local	Gabon	Clinique	CDL	M‚decin chef	\N	C‚libataire	0	Bac+4/5 - Ing‚nieur-Master	2 ans 0 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	350000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:42.530236	2025-06-30 17:15:42.530236			Actif	\N	\N	\N	\N	\N
44	Dossier … jour	CDL-2024-0040	EYUI NDONG Epse MBA OBAME Pascale Gaelle	Femme	1988-05-17	36	24	2048-05-31	2024-11-04	Bessieux	\N	\N	\N	008-1390822-2	466-669-179-0	Sage-femme Principale	CDD	2025-05-03	Local	Gabon	Clinique	CDL	M‚decin chef	Non-Cadre	Mari‚	1	Bac+2/3	0 ans 5 mois	\N	Salaire	virement cdl	AM1	194600.00	187450.00	\N	\N	55000.00	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:42.530236	2025-06-30 17:15:42.530236			Actif	\N	\N	\N	\N	\N
46	\N	CDL-2024-0042	FANGUINOVENY Wilfried	Homme	1978-12-11	46	19	2043-12-11	2024-08-31	Bessieux		+24177855655			713-573-586-1	Directeur Développement et de la Stratégique	Prestataire	2026-08-30	Local	Gabon	Direction G‚n‚rale	CDL	Directeur G‚n‚ral	\N	C‚libataire	0	… renseigner	0 ans 11 mois		Honoraires	Virement bancaire		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	2000000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:42.530236	2025-08-13 14:23:29.788253			Actif	\N	\N	\N	\N	\N
48	\N	CDL-2024-0043	GNANHOUE Abiadou	Homme	1990-04-25	35	30	2055-04-25	2024-07-15	Bessieux						Infirmier(ère) (Labo)	Prestataire	2025-10-14	expatri‚	B‚nin	Clinique	CDL	InfirmiÈre Major	\N	C‚libataire	0	Bac+2/3	1 ans 1 mois		Honoraires	espŠces		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	250000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:42.530236	2025-08-13 14:24:10.671721			Actif	\N	\N	\N	\N	\N
71	\N	CDL-2024-0066	MATOUNGOU KOMBA Blandine	Femme	1997-06-02	28	37	2062-06-02	2024-04-02	Bessieux				001-1633155-4	428-742-591-8	Technicien supérieur de laboratoire	CDI	\N	Local	Gabon	Laboratoire	CDL	Responsable laboratoire	\N	C‚libataire	0	Bac+2/3	1 ans 4 mois		Salaire	virement cdl		300000.00	0.00	0.00	0.00	35330.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:19:44.074055	2025-08-13 14:35:56.198158			Actif	\N	\N	\N	\N	\N
49	Dossier … completer	CDL-2024-0044	GONDJOUT Fran Christina Divine	Femme	1996-08-20	28	32	2056-08-31	2024-12-06	Bessieux			fran.gondjout@centre-diagnostic.com			Stagiaire Agent de saisie et cotation	stage PNPE	2025-05-08	Local	Gabon	Accueil/Facturation	CDL	chef comptable	Non-Cadre	C‚libataire	1	… renseigner	0 ans 4 mois		Indemnit‚ de Stage	virement cdl		0.00	\N	0.00	0.00	0.00	0.00	\N	\N	\N	\N	\N	0.00	180000.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:42.530236	2025-06-30 17:15:42.530236			Actif	\N	\N	\N	\N	\N
50	Dossier complet	CDL-2024-0045	HOUENASSI D. Martin	Homme	1961-01-01	64	-4	2021-01-31	2024-10-09	Bessieux			martin.houenassi@centre-diagnostic.com			Professeur en cardiologie	Prestataire	2025-10-08	expatri‚	B‚nin	Clinique	CDL	Directeur G‚n‚ral	Cadre	C‚libataire	0	Doctorat			Honoraires	virement cdl		0.00	\N	0.00	0.00	0.00	0.00	\N	\N	\N	\N	\N	1500000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:42.530236	2025-06-30 17:15:42.530236			Actif	\N	\N	\N	\N	\N
72	\N	CDL-2025-0067	MATSANGA FATOMBI Waridath	Femme	1997-04-30	28	37	2062-04-30	2025-01-29	Bessieux						Infirmière	prestataire	2025-07-28	Local	Gabon	Clinique	CDL	cadre de sant‚	\N	C‚libataire	0	Niveau Bac	0 ans 6 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	250000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:19:44.074055	2025-08-13 14:36:16.113239			Actif	\N	\N	\N	\N	\N
77	\N	CDL-2024-0072	MBENGUE MANDZEYI Rosette Floria	Femme	2002-09-23	22	43	2067-09-23	2024-12-19	Bessieux						Stagiaire infirmière polyvalente	stage PNPE	2025-06-18	Local	Gabon	Clinique	CDL	InfirmiÈre Major	\N	C‚libataire	0	Bac+2/3	0 ans 7 mois		Indemnit‚ de Stage	espŠces		0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:19:44.074055	2025-08-13 14:38:24.230515			Actif	\N	\N	\N	\N	\N
74	Dossier … completer	CDL-2024-0069	MBA MEZUI EDOUARD	Homme	1990-03-17	35	25	2050-03-31	2024-01-12	Bessieux	\N	\N	\N	\N	\N	Agent d'entretien	Prestataire	2025-06-30	Local	Gabon	Hotellerie/Hospitalit‚/Buanderie/Self	CDL	Responsable Accueil et Hospitalit‚	Non-Cadre	C‚libataire	0	Niveau ‚l‚mentaire	1 ans 3 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	150000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:19:44.074055	2025-06-30 17:19:44.074055			Actif	\N	\N	\N	\N	\N
76	Dossier complet	CDL-2024-0071	MBADINGA MICKALA STESSY	Homme	1995-08-30	29	31	2055-08-31	2024-12-16	Bessieux	\N	\N	\N			Brancardier	CDD	2025-06-15	Local	Gabon	Clinique	CDL	M‚decin chef	Non-Cadre	C‚libataire	0	Niveau Bac	0 ans 4 mois		Honoraires	virement cdl		0.00	\N	0.00	0.00	0.00	0.00	\N	\N	\N	\N	\N	150000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:19:44.074055	2025-06-30 17:19:44.074055			Actif	\N	\N	\N	\N	\N
78	\N	CDL-2025-0073	MBIA NDZALE Bertancia Ruth Cindy	Femme	1998-10-30	26	39	2063-10-30	2025-01-01	Bessieux				001-1688656-5	677-578-811-8	Infirmière	CDD	2025-06-29	Local	Gabon	Clinique	CDL	InfirmiÈre Major	\N	C‚libataire	0	Bac+2/3	0 ans 7 mois		Salaire	virement cdl	7	153500.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:19:44.074055	2025-08-13 14:38:48.128259			Actif	\N	\N	\N	\N	\N
82	\N	CDL-2025-0074	MELO TECHE Ghislaine Armelle	Femme	1992-02-01	33	32	2057-02-01	2025-02-17	Bessieux			ghislaine.melo@centre-diagnostic.com			Médecin Cardiologue	CDD	2026-02-16	expatri‚	Cameroun	Clinique	CDL	M‚decin chef	\N	Mari‚	0	Doctorat	0 ans 5 mois		Salaire	virement cdl	C3	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:06:24.292578	2025-08-13 14:39:22.155085			Actif	\N	\N	\N	\N	\N
83	Dossier complet	CDL-2025-0075	MENGUE MBA Rudmina Gaelle	Femme	1991-08-09	\N	27	2051-08-31	2025-02-03	Bessieux	\N	\N	\N	\N	\N	Sage-femme	CDD	2025-05-02	Local	Gabon	Clinique	CDL	Cadre de sant‚	Non-Cadre	C‚libataire	0	Bac+3/4	0 ans 2 mois	\N	Salaire	virement cdl	5	123100.00	28000.00	\N	\N	\N	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:06:24.292578	2025-07-01 07:06:24.292578			Actif	\N	\N	\N	\N	\N
89	Dossier … completer	CDL-2023-0077	MBOUMBA Rita Joyce	Femme	1991-06-01	33	27	2051-06-30	2023-01-01	Bessieux			rita.mboumba@centre-diagnostic.com	001-1670032-9		Responsable communication	CDD	2025-07-31	Local	Gabon	Marketing/Communication	CDL	Directeur G‚n‚ral	Cadre	C‚libataire	0	Bac+4/5 - Ing‚nieur-Master	2 ans 3 mois		Salaire	virement cdl		300000.00	180000.00	100000.00	70000.00	100000.00	70000.00	44000.00	\N	\N	\N	\N	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:06:24.292578	2025-07-01 07:06:24.292578			Actif	\N	\N	\N	\N	\N
94	Dossier … completer	CDL-2022-0078	MENGUE ME NDONG N'NANG Berthe Eleonore	Femme	1990-03-26	35	25	2050-03-31	2022-09-01	Bessieux			berthe.menguemendong@centre-diagnostic.com	001-1641074-7	359-842-728-8	Agent call center	CDI	\N	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	1	Bac+2/3	2 ans 7 mois	InfimiŠre	Salaire	virement cdl	4	120000.00	30000.00	0.00	0.00	0.00	35000.00	12000.00	\N	\N	\N	\N	100000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:06:24.292578	2025-07-01 07:06:24.292578			Actif	\N	\N	\N	\N	\N
96	Dossier complet	CDL-2024-0079	MICKALA MICKALA Keine Davy	Homme	1996-02-04	29	31	2056-02-29	2024-12-16	Bessieux	\N	\N	\N	001-1691947-3	\N	Brancardier	CDD	2025-06-15	Local	Gabon	Clinique	CDL	M‚decin chef	Non-Cadre	C‚libataire	0	Niveau Bac	0 ans 4 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	150000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:06:24.292578	2025-07-01 07:06:24.292578			Actif	\N	\N	\N	\N	\N
40	\N	CDL-2023-0036	EKOUME-EYEGUE Emma-Béatrice	Femme	1994-12-24	30	35	2059-12-24	2023-06-30	Bessieux				016-1388344-4	739-444-537-6	Agent d'accueil et facturation	CDI	\N	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	\N	C‚libataire	1	Bac+2/3	2 ans 1 mois		Salaire	Virement bancaire	7	150000.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:21.842587	2025-08-13 14:17:28.805235			Actif	\N	\N	\N	\N	\N
112	\N	CDL-2025-0094	NGAFOMO ESSAMA Marie Ghislaine	Femme	1991-10-09	33	32	2056-10-09	2025-02-04	Bessieux						Infirmière Assistante	CDD	2025-05-03	Local	Gabon	Clinique	CDL	Cadre de sant‚	\N	C‚libataire	1	Niveau Bac	0 ans 6 mois		Salaire	virement cdl	5	123100.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:46.910981	2025-08-13 14:47:18.782892			Actif	\N	\N	\N	\N	\N
85	\N	CDL-2024-0076	MENGUE NZE Sonia	Homme	\N	\N	\N	\N	2024-08-05							Stagiaire Imagerie Médicale	stage PNPE	2025-07-18		Gabon	Formation	CDL		\N	Célibataire	0		1 ans 0 mois		Salaire			0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:06:24.292578	2025-08-13 14:40:05.080692			Actif	\N	\N	\N	\N	\N
98	\N	CDL-2024-0081	MIKIMOU NDONG Huster Hance	Homme	1997-09-08	27	38	2062-09-08	2024-11-30	Bessieux				001-1691944-1		Technicien supérieur de laboratoire	CDD	2025-05-30	Local	Gabon	Laboratoire	CDL	Responsable laboratoire	\N	C‚libataire	0	Bac+2/3	0 ans 8 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	250000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:06:24.292578	2025-08-13 14:40:48.297228			Actif	\N	\N	\N	\N	\N
113	\N	CDL-2024-0095	NGAWOUMA Lozi Gael	Homme	1994-03-10	31	34	2059-03-10	2024-11-24	Bessieux						Medecin généraliste de garde	Prestataire	2025-06-22	Local	Gabon	Clinique	CDL	M‚decin chef	\N	C‚libataire	2	Doctorat	0 ans 8 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:46.910981	2025-08-13 14:47:51.457222			Actif	\N	\N	\N	\N	\N
114	\N	CDL-2022-0096	NGO NTJAM Epse KAMGANG Elisabeth Laurence	Femme	1992-01-01	33	32	2057-01-01	2022-07-06	Bessieux						Technicien supérieur de laboratoire	Prestataire	2025-07-05	Local	Gabon	Laboratoire	CDL	Responsable laboratoire	\N	Mari‚	0	Bac+2/3	3 ans 1 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	300000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:46.910981	2025-08-13 14:48:19.018114			Actif	\N	\N	\N	\N	\N
116	\N	CDL-2025-0098	NGONDE MASSANDE Sandra	Femme	1989-04-16	36	29	2054-04-16	2025-01-25	Bessieux						Infirmière	prestataire	2025-04-23	Local	Gabon	Clinique	CDL	Cadre de sant‚	\N	C‚libataire	0	a renseigner	0 ans 6 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:46.910981	2025-08-13 14:48:49.32141			Actif	\N	\N	\N	\N	\N
117	\N	CDL-2025-0099	NGONDOU épse NZOULOU Martine	Femme	1983-12-07	41	24	2048-12-07	2025-01-26	Bessieux						Infirmière	prestataire	2025-06-25	Local	Gabon	Clinique	CDL	Cadre de sant‚	\N	Mari‚	0	Bac+3/4	0 ans 6 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:46.910981	2025-08-13 14:49:15.007267			Actif	\N	\N	\N	\N	\N
118	\N	CDL-2024-0100	NGUELI Dorincia Yannicke	Femme	2002-01-21	23	42	2067-01-21	2024-12-19	Bessieux						Stagiaire infirmière polyvalente	stage PNPE	2025-06-18	Local	Gabon	Clinique	CDL	InfirmiÈre major	\N	C‚libataire	0	Bac+2/3	0 ans 7 mois		Indemnit‚ de Stage	virement cdl		0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:46.910981	2025-08-13 14:49:43.716952			Actif	\N	\N	\N	\N	\N
119	\N	CDL-2024-0101	NGUEMA ELLA Serghino	Homme	1989-12-15	35	30	2054-12-15	2024-11-19	Bessieux						Technicien supérieur d'imagerie médicale	Prestataire	2025-05-18	Local	Gabon	Clinique	CDL	M‚decin chef	\N	C‚libataire	0	Niveau Bac	0 ans 8 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:46.910981	2025-08-13 14:50:30.263229			Actif	\N	\N	\N	\N	\N
97	Dossier … completer pour passage en CDD	CDL-2024-0080	MIHINDOU Carmen Christelle	Femme	1990-11-16	34	26	2050-11-30	2024-06-01	Bessieux	\N	\N	\N	\N	154-171-248-5	Agent d'accueil et facturation	CDD	2025-06-30	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	3	Bac+2/3	0 ans 10 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	180000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:06:24.292578	2025-07-01 07:06:24.292578			Actif	\N	\N	\N	\N	\N
100	\N	CDL-2024-0083	MOHAMADOU KOULSSOUM	Femme	\N	\N	\N	\N	\N	Bessieux						Médecin Généraliste de garde	Prestataire	\N	Local	Gabon	Clinique	CDL	M‚decin chef	\N	C‚libataire	0	Doctorat	\N		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:16.968745	2025-08-13 14:41:20.339319			Actif	\N	\N	\N	\N	\N
180	\N	CDL-2025-0147	KANINDA MASSIALA KAMENA Justin	Homme	2002-08-11	22	37	2062-08-11	2025-06-10	Leconi	\N	\N	\N	\N	\N	Technicien laboratoire	Local	2025-09-09	CDD	Gabon	Laboratoire	CDL	Responsable laboratoire	Non-Cadre	C‚libataire	0	Bac+3/4	0 ans 0 mois	\N	Salaire	Virement CDL	6	250000.00	\N	35000.00	\N	0.00	0.00	\N	\N	\N	\N	\N	0.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:12:55.622527	2025-07-01 07:12:55.622527			Actif	\N	\N	\N	\N	\N
99	Dossier … completer	CDL-2024-0082	MIKOLO KENENI Henri	Homme	1997-12-30	27	33	2057-12-31	2024-11-18	Bessieux	\N	\N	\N	001-1691944-0	107-596-624-4	Cuisinier	CDD	2025-05-17	Local	Gabon	Hotellerie/Hospitalit‚/Buanderie/Self	CDL	Responsable Accueil et hospitalit‚	Non-Cadre	C‚libataire	0	Niveau ‚l‚mentaire	0 ans 5 mois	\N	Salaire	virement cdl	5	123100.00	105469.00	\N	\N	\N	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:06:24.292578	2025-07-01 07:06:24.292578			Actif	\N	\N	\N	\N	\N
102	\N	CDL-2024-0085	MOUKOUMOU ILINDI Trécy	Femme	1997-11-12	27	38	2062-11-12	2024-12-08	Bessieux				001-1650654-4		Agent d'accueil et facturation	CDD	2025-09-07	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	\N	C‚libataire	0	Bac+2/3	0 ans 8 mois		Salaire	Virement bancaire	5	123100.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:16.968745	2025-08-13 14:43:04.266168			Actif	\N	\N	\N	\N	\N
101	Dossier … completer	CDL-2024-0084	MOLEDY PAKA GAREL STONE	Homme	1993-10-11	31	29	2053-10-31	2024-01-12	Bessieux	\N	\N	\N	\N	\N	Agent d'entretien	Prestataire	2025-07-11	Local	Gabon	Hotellerie/Hospitalit‚/Buanderie/Self	CDL	Responsable Accueil et Hospitalit‚	Non-Cadre	C‚libataire	0	Bac+2/3	1 ans 3 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	150000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:16.968745	2025-07-01 07:07:16.968745			Actif	\N	\N	\N	\N	\N
103	\N	CDL-2025-0086	MOUNDOUNGA Ruth Grace	Femme	1991-12-29	33	32	2056-12-29	2025-01-01	Bessieux			ruth.moundounga@centre-diagnostic.com	001-1682727-0		Secrétaire médicale	CDD	2025-06-29	Local	Gabon	Laboratoire	CDL	responsable accueil et facturaion	\N	C‚libataire	0	Bac+2/3	0 ans 7 mois		Salaire	Virement bancaire	7	153500.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:16.968745	2025-08-13 14:43:49.562926			Actif	\N	\N	\N	\N	\N
104	\N	CDL-2023-0087	MOUNGA MBASSI Merveille	Femme	1991-12-28	33	32	2056-12-28	2023-05-31	Bessieux			merveille.mounga@centre-diagnostic.com			Médecin Généraliste	Prestataire	2025-12-24	expatri‚	Cameroun	Clinique	CDL	M‚decin chef	\N	C‚libataire	0	Doctorat	2 ans 2 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	200000.00	0.00	0.00	0.00	0.00	0.00	0.00	800000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:16.968745	2025-08-13 14:44:51.287051			Actif	\N	\N	\N	\N	\N
106	\N	CDL-2025-0089	MPEMBA Alida Nathaelle	Femme	1986-11-07	38	27	2051-11-07	2025-01-28	Bessieux						Infirmière	prestataire	2025-06-27	Local	Gabon	Clinique	CDL	Cadre de sant‚	\N	Mari‚	0	Bac+3/4	0 ans 6 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:16.968745	2025-08-13 14:45:23.310714			Actif	\N	\N	\N	\N	\N
105	Dossier … completer	CDL-2024-0088	MOUSSOUNDA SAJOUX Yohan Ulrich Roger	Homme	1992-10-13	32	28	2052-10-31	2024-12-09	Bessieux	\N	\N	\N	\N	\N	Agent d'accueil et facturation	CDD	2025-09-08	Local	Gabon	Accueil/Facturation	CDL	responabla accueil et facturation	Non-Cadre	C‚libataire	2	Bac+2/3	0 ans 4 mois	\N	Salaire	virement cdl	5	123100.00	5000.00	\N	\N	\N	35000.00	\N	\N	25000.00	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:16.968745	2025-07-01 07:07:16.968745			Actif	\N	\N	\N	\N	\N
107	\N	CDL-2024-0090	MUSSIALY MPAMAH Cindy Joy	Femme	1998-12-22	26	39	2063-12-22	2024-09-30	Bessieux				001-1683240-3	877-253-765-4	Infirmière	CDD	2025-10-30	Local	Gabon	Clinique	CDL	M‚decin chef	\N	C‚libataire	1	Bac+2/3	0 ans 10 mois		Salaire	virement cdl	7	153500.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:16.968745	2025-08-13 14:45:41.102199			Actif	\N	\N	\N	\N	\N
115	Dossier complet	CDL-2024-0097	NGOMA MAKOUNDI Elie le Tchisbith	Homme	1999-04-12	26	34	2059-04-30	2024-12-20	Bessieux						Stagiaire infirmier d'Etat polyvalent	stage PNPE	2025-06-19	Local	Gabon	Clinique	CDL	infirmiŠre Major	Non-Cadre	C‚libataire	0	Bac+2/3	0 ans 3 mois		Indemnit‚ de Stage	espŠces		0.00	\N	0.00	0.00	0.00	0.00	\N	\N	\N	\N	\N	0.00	180000.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:46.910981	2025-07-01 07:07:46.910981			Actif	\N	\N	\N	\N	\N
75	\N	CDL-2023-0070	MBADINGA MBADINGA Dave Arsène	Homme	1993-12-11	31	34	2058-12-11	2023-09-17	Bessieux					330-312-928-9	Infirmier(ère) assistant(e)	Prestataire	2025-10-30	Local	Gabon	Clinique	CDL	InfirmiÈre Major	\N	C‚libataire	0	Bac+2/3	1 ans 11 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	250000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:19:44.074055	2025-08-13 14:37:45.93474			Actif	\N	\N	\N	\N	\N
110	\N	CDL-2024-0092	NDOMINGIELO NGUIYA Eldad	Homme	\N	\N	\N	\N	2024-12-30			076334695	eldad.ndomingielo@centre-diagnostic.com			Administrateur Système et Sécurité‚ réseau	CDD	2025-12-29		Gabon	Informatique	CDL		\N	Célibataire	0		0 ans 7 mois		Salaire			0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:16.968745	2025-08-13 14:46:51.271491			Actif	\N	\N	\N	\N	\N
121	\N	CDL-2021-0103	NGWE TAKA Prisca	Femme	1998-05-06	27	38	2063-05-06	2021-02-13	Bessieux						Infirmier(ère)	Prestataire	2025-12-30	expatri‚	Cameroun	Clinique	CDL	InfirmiÈre Major	\N	C‚libataire	0	Bac+2/3	4 ans 6 mois		Honoraires	espŠces		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	250000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:08:26.652552	2025-08-13 14:51:38.017847			Actif	\N	\N	\N	\N	\N
125	\N	CDL-2024-0106	NSEGHE NDONG Gemima Peguy	Femme	2000-05-27	25	40	2065-05-27	2024-12-19	Bessieux						Stagiaire infirmière polyvalente	stage PNPE	2025-06-18	Local	Gabon	Clinique	CDL	InfirmiÈre major	\N	C‚libataire	0	Bac+2/3	0 ans 7 mois		Indemnit‚ de Stage	virement cdl		0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:08:26.652552	2025-08-13 14:53:13.641052			Actif	\N	\N	\N	\N	\N
135	\N	CDL-2024-0110	NYINDONG NZE Winona Palmira Océane	Femme	2000-05-27	25	40	2065-05-27	2024-12-08	Bessieux						Équipière polyvalente	CDD	2025-06-09	Local	Gabon	Accueil/Facturation	WALHYA	Manager Healthcare	\N	C‚libataire	3	Niveau Bac	0 ans 8 mois		Salaire	Virement bancaire	4	117600.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:08:26.652552	2025-08-13 14:54:28.210387			Actif	\N	\N	\N	\N	\N
139	\N	CDL-2024-0114	NZE DA SILVA Georges Pedro	Homme	1984-04-26	41	24	2049-04-26	2024-12-15	Bessieux			pedro.nze@centre-diagnostic.com	001-1461658-8		Responsable bureau des entrées	CDI	\N	Local	Gabon	Accueil/Facturation	CDL	Directeur G‚n‚ral	\N	C‚libataire	2	Bac+2/3	0 ans 8 mois		Salaire	virement cdl	AM2	226700.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:00.40689	2025-08-13 14:55:25.710608			Actif	\N	\N	\N	\N	\N
126	\N	CDL-2025-0107	NTOUTOUME ANGOUE Marie Thérèse	Femme	1983-06-28	42	23	2048-06-28	2025-01-14	Bessieux				001-1129136-5	242-312-748-1	Infirmière	CDD	2025-04-13	Local	Gabon	Clinique	CDL	InfirmiÈre Major	\N	Mari‚	3	Bac+2/3	0 ans 7 mois		Salaire	virement cdl	7	153500.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:08:26.652552	2025-08-13 13:47:10.2429			Actif	\N	\N	\N	\N	\N
131	Dossier … completer	CDL-2024-0109	NYANGUI Perrine	Femme	1994-11-17	30	30	2054-11-30	2024-08-27	Bessieux	\N	\N	\N	001-1680750-4	466-660-242-2	Agent d'accueil et facturation	CDD	2025-06-25	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	0	Bac+4/5 - Ing‚nieur - Master	0 ans 7 mois	\N	Salaire	virement cdl	5	123100.00	5000.00	\N	\N	\N	35000.00	25000.00	\N	\N	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:08:26.652552	2025-07-01 07:08:26.652552			Actif	\N	\N	\N	\N	\N
136	Dossier … completer	CDL-2024-0111	NZAMBA TSOMAKEKA Esther Eunice	Femme	1993-03-21	32	28	2053-03-31	2024-05-06	Bessieux	\N	\N	\N	\N	\N	Technicienne de laboratoire	CDD	2025-06-05	Local	Gabon	Laboratoire	CDL	Responsable laboratoire	Non-Cadre	C‚libataire	1	Bac+2/3	0 ans 11 mois	\N	Salaire	virement cdl	6	131800.00	97000.00	\N	\N	\N	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:08:26.652552	2025-07-01 07:08:26.652552			Actif	\N	\N	\N	\N	\N
137	Dossier complet	CDL-2024-0112	NZANG OVONO Catrina lyse	Femme	1994-06-29	30	30	2054-06-30	2024-08-27	Bessieux	\N	\N	\N	001-1688311-7	\N	Agent d'accueil et facturation	CDD	2025-06-26	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	Mari‚	1	Bac+2/3	0 ans 7 mois	\N	Salaire	virement cdl	5	123100.00	5000.00	\N	\N	\N	35000.00	25000.00	\N	\N	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:08:26.652552	2025-07-01 07:08:26.652552			Actif	\N	\N	\N	\N	\N
138	Dossier … completer	CDL-2023-0113	NZAOU MIKOMBI Raymonde	Femme	1979-02-26	46	14	2039-02-28	2023-04-05	Bessieux	\N	\N	\N	\N	\N	Agent d'entretien	Prestataire	2025-06-30	Local	Gabon	Hotellerie/Hospitalit‚/Buanderie/Self	CDL	Responsable Accueil et Hospitalit‚	Non-Cadre	C‚libataire	3	Niveau ‚l‚mentaire	2 ans 0 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	150000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:00.40689	2025-07-01 07:09:00.40689			Actif	\N	\N	\N	\N	\N
143	\N	CDL-2025-0118	OBAME ASSOUMOU Victor Cédrick	Homme	1994-02-22	31	34	2059-02-22	2025-01-05	Bessieux			victor.obame@centre-diagnostic.com			Médecin Généraliste	CDD	2025-07-04	Local	Gabon	Clinique	CDL	M‚decin chef	\N	C‚libataire	0	Doctorat	0 ans 7 mois		Salaire	virement cdl	C1	295400.00	0.00	0.00	0.00	250000.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:00.40689	2025-08-13 14:57:02.340166			Actif	\N	\N	\N	\N	\N
144	\N	CDL-2024-0119	OBONE MBA Ursula	Femme	1993-09-12	31	34	2058-09-12	2024-01-31	Bessieux						Manipulateur imagérie	Prestataire	2025-10-30	Local	Gabon	Clinique	CDL	P“le imagerie	\N	C‚libataire	1	Niveau Bac	1 ans 6 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	150000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:00.40689	2025-08-13 15:00:03.783324			Actif	\N	\N	\N	\N	\N
142	Dossier … completer	CDL-2024-0117	OBAME AKOUE Emmanuel Fortune	Homme	1997-06-29	27	33	2057-06-30	2024-05-01	Bessieux	\N	\N	\N	\N	\N	Cuisinier	CDD	2025-06-30	Local	Gabon	Hotellerie/Hospitalit‚/Buanderie/Self	CDL	Responsable Accueil et Hospitalit‚	Non-Cadre	C‚libataire	0	Niveau Bac	0 ans 11 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	180000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:00.40689	2025-07-01 07:09:00.40689			Actif	\N	\N	\N	\N	\N
145	\N	CDL-2023-0120	OFFOU NFOULOU Chimène	Femme	1983-04-28	42	23	2048-04-28	2023-04-25	Bessieux						Buandière	Prestataire	2025-06-29	Local	Gabon	Hotellerie/Hospitalit‚/Buanderie/Self	CDL	Responsable Accueil et Hospitalit‚	\N	C‚libataire	0	Niveau ‚l‚mentaire	2 ans 3 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	190000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:00.40689	2025-08-13 15:00:35.531455			Actif	\N	\N	\N	\N	\N
147	Dossier … completer	CDL-2024-0122	OGOULA BEYA Marina	Femme	1987-04-13	38	22	2047-04-30	2024-10-02	Bessieux			marina.ogoula@centre-diagnostic.com		696-917-798-0	Agent de saisie et cotation	CDD	2025-07-01	Local	Gabon	Cotation	CDL	Chef comptable	Non-Cadre	C‚libataire	1	Bac+4/5 - Ing‚nieur-Master	0 ans 6 mois		Salaire	virement cdl	5	123100.00	78200.00	0.00	0.00	0.00	35000.00	\N	\N	\N	\N	\N	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:00.40689	2025-07-01 07:09:00.40689			Actif	\N	\N	\N	\N	\N
148	Dossier … completer	CDL-2025-0123	OKOUDJI OKOGHO Hans Fenett	Homme	2025-03-02	0	60	2085-03-31	2025-03-03	Bessieux			hans.okoudji@centre-diagnostic.com	015-14553256-6	520-279-788-0	Superviseur Achat et Stock	CDI	\N	Local	Gabon	Achats/Stock	CDL	Chef comptable	Cadre	C‚libataire	1	Bac+2/3	0 ans 1 mois		Salaire	virement cdl	7	153500.00	249461.00	100000.00	0.00	150000.00	35000.00	\N	\N	\N	\N	\N	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:00.40689	2025-07-01 07:09:00.40689			Actif	\N	\N	\N	\N	\N
127	\N	CDL-2024-0108	NTSAME ABIAGA Elodie Célica	Femme	1994-11-16	30	35	2059-11-16	2024-12-11	Bessieux						Medecin généraliste	prestataire	2025-06-10	Local	Gabon	Clinique	CDL	M‚decin chef	\N	C‚libataire	0	Doctorat	0 ans 8 mois		Honoraires	espŠces		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:08:26.652552	2025-08-13 13:45:50.320979			Actif	\N	\N	\N	\N	\N
149	\N	CDL-2021-0124	OLYMPIO Joris Loyce	Homme	1985-05-28	40	25	2050-05-28	2020-12-31	Bessieux			loyce.olympio@centre-diagnostic.com	001-1081773-1	543-074-800-3	Président Directeur Général	CDI	\N	Local	Gabon	Direction G‚n‚rale	CDL	Conseil d'Administration	\N	Mari‚	3	Bac+4/5 - Ing‚nieur - Master	4 ans 7 mois	MII marketing	Salaire	virement cdl	HC	850000.00	0.00	500000.00	0.00	600000.00	250000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:55.929938	2025-08-13 15:02:04.361066			Actif	\N	\N	\N	\N	\N
54	\N	CDL-2024-0049	IGOUHET YENO TATIANA VALERIE	Femme	1987-07-22	38	27	2052-07-22	2024-07-31	Bessieux						Caissière Principale	CDI	\N	Local	Gabon	Finance/Comptabilit‚	CDL	chef comptable	\N	C‚libataire	1	Bac+4/5 - Ing‚nieur - Master	1 ans 0 mois		Salaire	Virement bancaire	7	153500.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:24:49.537174	2025-08-13 14:26:40.992001			Actif	\N	\N	\N	\N	\N
55	Dossier complet	CDL-2024-0050	KALUNGA BUBU BOY Daestee Charlotte	Femme	2000-04-22	24	36	2060-04-30	2024-08-27	Bessieux			charlotte.kalunga@centre-diagnostic.com	001-1680751-2		Agent d'Accueil et Administratif	CDD	2025-06-25	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	1	Bac+2/3	0 ans 7 mois		Salaire	virement cdl	5	123100.00	5000.00	0.00	0.00	0.00	35000.00	25000.00	\N	\N	\N	\N	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:24:49.537174	2025-07-01 07:24:49.537174			Actif	\N	\N	\N	\N	\N
56	\N	CDL-2022-0051	KAMDEU TCHAMDEU AUDREY EMILIE	Femme	1996-07-21	29	36	2061-07-21	2022-12-13	Bessieux						Médecin Généraliste de garde	Prestataire	2025-06-23	expatri‚	Cameroun	Clinique	CDL	M‚decin chef	\N	C‚libataire	0	… renseigner	2 ans 8 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:24:49.537174	2025-08-13 14:27:38.004415			Actif	\N	\N	\N	\N	\N
150	Dossier … completer	CDL-2024-0125	ONDO AYO Marvy Claude	Homme	1996-12-11	28	32	2056-12-31	2024-05-06	Bessieux	\N	\N	\N	001-1670035-2	\N	Technicien de laboratoire	CDD	2025-05-05	Local	Gabon	Laboratoire	CDL	Responsable laboratoire	Non-Cadre	C‚libataire	0	Bac+2/3	0 ans 11 mois	\N	Salaire	virement cdl	\N	180000.00	\N	\N	\N	\N	35000.00	35000.00	\N	\N	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:55.929938	2025-07-01 07:09:55.929938			Actif	\N	\N	\N	\N	\N
176	\N	CDL-2025-0143	TSHIBOLA MBUYI Marie Louise	Femme	1984-04-13	41	19	2044-04-13	2025-05-12	Moanda	\N	\N	\N	\N	\N	Responsable laboratoire	Local	2025-08-11	Prestataire	Gabon	Laboratoire	CDL	Directeur g‚n‚ral	Cadre	C‚libataire	0	Doctorat	0 ans 1 mois	\N	Honoraires	Virement CDL	\N	0.00	\N	\N	\N	0.00	0.00	0.00	\N	0.00	\N	\N	1000000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:55.929938	2025-07-01 07:09:55.929938			Actif	\N	\N	\N	\N	\N
52	\N	CDL-2024-0047	IBONDOU NZIENGUI Sylvanie	Femme	1981-10-05	43	22	2046-10-05	2024-04-01	Bessieux				001-1106926-6		Infirmier(ère)	CDD	2025-09-30	Local	Gabon	Clinique	CDL	InfirmiÈre Major	\N	Mari‚	3	Niveau ‚l‚mentaire	1 ans 4 mois		Salaire	Virement bancaire	7	150000.00	0.00	0.00	0.00	50000.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:24:49.537174	2025-08-13 14:25:10.689733			Actif	\N	\N	\N	\N	\N
178	\N	CDL-2025-0145	POUNGUI Ulrich	Homme	1993-12-27	31	28	2053-12-27	2025-06-10	Libreville	\N	224-302-614	\N	\N	\N	Technicien laboratoire	Local	2025-09-09	CDD	Gabon	Laboratoire	CDL	Responsable laboratoire	Non-Cadre	C‚libataire	2	Bac+4/5 - Ing‚nieur-Master	0 ans 0 mois	MaŒtre II	Salaire	Virement CDL	6	250000.00	\N	35000.00	\N	0.00	0.00	\N	\N	\N	\N	\N	0.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:55.929938	2025-07-01 07:09:55.929938			Actif	\N	\N	\N	\N	\N
186	\N	CDL-2025-0153	MAGUIAKAM DOMTCHOUENG	Femme	1999-09-18	25	40	2064-09-18	2025-04-22	LIibreville						Médecin généraliste	Local	2025-07-21	Prestataire	Gabon	Clinique	CDL	M‚decin chef	\N	C‚libataire	0	Doctorat	0 ans 3 mois		Honoraires	Virement CDL		0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:12:55.622527	2025-08-13 14:32:29.168062			Actif	\N	\N	\N	\N	\N
181	\N	CDL-2025-0148	NKENE BEKA Alliance Josiane	\N	\N	\N	\N	\N	2025-05-11	\N	\N			\N	\N	Techinicienne Laboratoire	Local	2025-08-10	\N	\N	Laboratoire	CDL	\N	\N	\N	\N	\N	0 ans 2 mois	\N	\N	\N	\N	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:12:55.622527	2025-08-07 13:17:19.853909			Actif	\N	\N	\N	\N	\N
182	\N	CDL-2025-0149	EYI ASSOUMOU Flanel	Homme	1998-07-19	26	33	2058-07-19	2025-06-10	Oyem	\N	\N	\N	397-273-569-9	\N	Infirmier	Local	2025-09-09	CDD	Gabon	Laboratoire	CDL	cadre de sant‚	Non-Cadre	C‚libataire	0	Bac+2/3	0 ans 0 mois	\N	Salaire	Virement CDL	\N	0.00	\N	35000.00	\N	0.00	0.00	\N	\N	\N	\N	\N	0.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:12:55.622527	2025-07-01 07:12:55.622527			Actif	\N	\N	\N	\N	\N
183	\N	CDL-2025-0150	ILOMBE NDENDI1	Femme	1982-01-02	43	17	2042-01-02	2025-06-10	Libreville	\N	\N	\N	229-312-004-3	\N	Infirmier	Local	2025-09-09	CDD	Gabon	Clinique	CDL	cadre de sant‚	Non-Cadre	C‚libataire	1	Niveau ‚l‚mentaire	0 ans 0 mois	\N	Salaire	Virement CDL	6	250000.00	\N	35000.00	\N	0.00	0.00	\N	\N	\N	\N	\N	0.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:12:55.622527	2025-07-01 07:12:55.622527			Actif	\N	\N	\N	\N	\N
185	\N	CDL-2025-0152	DJOGNOU KUITCHOU Jessica Laura	Femme	2003-10-23	21	38	2063-10-23	2025-06-10	Yaound‚	\N	\N	\N	\N	\N	Technicienne laboratoire	expatri‚	2025-09-09	Prestataire	Gabon	Laboratoire	CDL	Responsable laboratoire	Non-Cadre	C‚libataire	0	Bac+2/3	0 ans 0 mois	\N	Honoraires	Virement CDL	\N	0.00	\N	35000.00	\N	0.00	0.00	\N	\N	\N	\N	\N	250000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:12:55.622527	2025-07-01 07:12:55.622527			Actif	\N	\N	\N	\N	\N
177	\N	CDL-2025-0144	Kegne Valdy	Homme	1997-08-05	28	37	2062-08-05	2025-06-09	Libreville						Technicien laboratoire	Local	2025-09-08	CDD	Gabon	Laboratoire	CDL	Responsable laboratoire	\N	C‚libataire	0	Bac+4/5 - Ing‚nieur-Master	0 ans 2 mois	MaŒtre II	Salaire	Virement CDL	6	250000.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:55.929938	2025-08-13 14:20:23.773096			Actif	\N	\N	\N	\N	\N
179	\N	CDL-2025-0146	MADOUNGOU Beverly Esdras	Femme	1998-10-14	26	39	2063-10-14	2025-06-09	Mbigou		338-321-524-1				Infirmière	Local	2025-09-08	CDD	Gabon	Clinique	CDL	cadre de sant‚	\N	C‚libataire	1	Bac+2/3	0 ans 2 mois		Salaire	Virement CDL	6	250000.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:55.929938	2025-08-13 14:31:19.394727			Actif	\N	\N	\N	\N	\N
152	\N	CDL-2023-0127	ONDOUA Fernandez Mesimin	Homme	1991-08-26	33	32	2056-08-26	2023-02-09	Bessieux			fernandez.ondoua@centre-diagnostic.com	015-1454454-4	342-728-245-7	Médecin Généraliste	Prestataire	2026-02-11	Local	Gabon	Clinique	CDL	M‚decin chef	\N	C‚libataire	2	Doctorat	2 ans 6 mois		Salaire	virement cdl		740000.00	0.00	300000.00	0.00	0.00	100000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-08-13 15:02:36.960535			Actif	\N	\N	\N	\N	\N
154	\N	CDL-2024-0129	ONGOUTA MAFIA Grace Cherile	Femme	1991-09-05	33	32	2056-09-05	2024-11-23	Bessieux						Medecin généraliste	prestataire	2025-05-24	Local	Gabon	Clinique	CDL	M‚decin chef	\N	C‚libataire	1	Doctorat	0 ans 8 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	650000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-08-13 15:03:39.851184			Actif	\N	\N	\N	\N	\N
155	\N	CDL-2024-0130	PAMO LATELA Ornélla Maeva	Femme	1997-06-16	28	37	2062-06-16	2024-11-21	Bessieux						Medecin généraliste de garde	Prestataire	2025-06-20	expatri‚	Cameroun	Clinique	CDL	M‚decin chef	\N	C‚libataire	0	Doctorat	0 ans 8 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-08-13 15:04:10.420637			Actif	\N	\N	\N	\N	\N
156	\N	CDL-2023-0131	PANGA Chimène	Femme	1986-02-14	39	26	2051-02-14	2023-06-12	Bessieux				001-1638823-2	000-002-305-8	Infirmier(ère)	CDD	2025-09-12	Local	Gabon	Clinique	CDL	InfirmiÈre Major	\N	C‚libataire	0	Niveau Bac	2 ans 2 mois		Salaire	virement cdl	7	150000.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-08-13 15:04:42.247068			Actif	\N	\N	\N	\N	\N
158	\N	CDL-2024-0133	SALOM RODRIGUEZ YANET ROSANA	Femme	1993-11-19	31	34	2058-11-19	2024-03-03	Bessieux			yanet.salom@centre-diagnostic.com			Médecin généraliste	Prestataire	\N	expatri‚	Cuba	Clinique	CDL	M‚decin chef	\N	C‚libataire	0	Doctorat	1 ans 5 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	700000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-08-13 15:05:50.362102			Actif	\N	\N	\N	\N	\N
161	\N	CDL-2022-0135	SANMA FARID	Homme	1991-12-29	33	32	2056-12-29	2022-10-31	Bessieux			farid.sanma@centre-diagnostic.com	001-1642344-3		Médecin anesthésiste-réanimateur	CDI	\N	expatri‚	B‚nin	Clinique	CDL	M‚decin chef	\N	Mari‚	2	Doctorat	2 ans 9 mois	Dipl“me R‚animateur	Salaire	virement cdl	HC	1500000.00	0.00	1000000.00	0.00	450000.00	200000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-08-13 15:06:23.037477			Actif	\N	\N	\N	\N	\N
59	\N	CDL-2023-0054	KEMEGNE NOUMENI Cathy Carmen	Femme	1992-07-25	33	32	2057-07-25	2023-07-19	Bessieux						Infirmier(ère) gastro	Prestataire	2026-03-18	Local	Gabon	Laboratoire	CDL	InfirmiÈre Major	\N	C‚libataire	0	Bac+2/3	2 ans 0 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	350000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:24:49.537174	2025-08-13 14:29:17.053093			Actif	\N	\N	\N	\N	\N
60	\N	CDL-2024-0055	KEMTCHOUANG SIMO Amyrel Karel	Femme	1997-06-24	28	37	2062-06-24	2024-06-25	Bessieux						Médecin généraliste de garde	Prestataire	2025-06-24	expatri‚	Cameroun	Clinique	CDL	M‚decin chef	\N	C‚libataire	0	Doctorat	1 ans 1 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:24:49.537174	2025-08-13 14:30:03.133034			Actif	\N	\N	\N	\N	\N
61	\N	CDL-2024-0056	KENGUE NDJIGHA SYLDANY	Femme	1992-05-29	33	32	2057-05-29	2024-02-13	Bessieux						Infirmier(ère)	Prestataire	2026-02-10	Local	Gabon	Clinique	CDL	InfirmiÈre Major	\N	C‚libataire	0	Bac+2/3	1 ans 6 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	250000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:25:01.569519	2025-08-13 14:30:27.227674			Actif	\N	\N	\N	\N	\N
64	\N	CDL-2023-0059	LAWAN Hadizatou	Femme	1990-01-29	35	30	2055-01-29	2023-02-26	Bessieux				001-1606598-8	397-274-744-5	Infirmier(ère)	CDI	\N	Local	Gabon	Clinique	CDL	InfirmiÈre Major	\N	C‚libataire	0	Niveau secondaire	2 ans 5 mois		Salaire	virement cdl	7	150000.00	0.00	0.00	0.00	43000.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:25:01.569519	2025-08-13 14:30:56.174368			Actif	\N	\N	\N	\N	\N
62	Dossier … completer	CDL-2024-0057	KOGUET NZOUBA Amanda Falone	Femme	1987-05-17	37	23	2047-05-31	2024-10-01	Bessieux	\N	\N	\N	001-1628597-4	623-850-523-2	Assistante Dentaire	CDD	2025-09-30	Local	Gabon	Clinique	CDL	InfirmiŠre Major	Non-Cadre	C‚libataire	1	Bac+2/3	0 ans 6 mois	\N	Salaire	virement cdl	6	131800.00	100097.00	\N	\N	\N	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:25:01.569519	2025-07-01 07:25:01.569519			Actif	\N	\N	\N	\N	\N
63	Dossier … completer	CDL-2024-0058	KOMBA MAYOMBO Vivaldie	Femme	1992-03-19	33	27	2052-03-31	2024-08-27	Bessieux	\N	\N	\N	001-1683028-2	103-079-667-5	Agent d'accueil et facturation	CDD	2025-06-25	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	2	Niveau Bac	0 ans 7 mois	\N	Salaire	espŠces	5	123100.00	5000.00	\N	\N	\N	35000.00	\N	\N	25000.00	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:25:01.569519	2025-07-01 07:25:01.569519			Actif	\N	\N	\N	\N	\N
65	\N	CDL-2023-0060	MAGONGA LEGNONGO Crèse	Homme	1998-05-04	27	38	2063-05-04	2023-11-26	Bessieux				001-1641495-4		Cuisinier principal	CDD	2025-05-25	Local	Gabon	Hotellerie/Hospitalit‚/Buanderie/Self	CDL	Responsable Accueil et Hospitalit‚	\N	C‚libataire	0	Niveau ‚l‚mentaire	1 ans 8 mois		Salaire	virement cdl		300000.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:25:01.569519	2025-08-13 14:31:54.301194			Actif	\N	\N	\N	\N	\N
67	\N	CDL-2024-0062	MAKOUNE SOP Michele	Femme	1996-02-27	29	36	2061-02-27	2024-11-24	Bessieux						Medecin généraliste de garde	prestataire	2025-06-23	expatri‚	Cameroun	Clinique	CDL	M‚decin chef	\N	C‚libataire	1	Doctorat	0 ans 8 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:25:01.569519	2025-08-13 14:33:05.389336			Actif	\N	\N	\N	\N	\N
66	Dsossier … completer	CDL-2023-0061	MAHINDZA SAFIOU Anzimath	Femme	1999-11-15	25	35	2059-11-30	2023-11-06	Bessieux	\N	\N	\N	\N	\N	Agent d'accueil et facturation	CDD	2025-05-05	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	0	Bac+2/3	1 ans 5 mois	\N	Salaire	virement cdl	5	123100.00	79100.00	\N	\N	\N	35000.00	\N	\N	25000.00	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:25:01.569519	2025-07-01 07:25:01.569519			Actif	\N	\N	\N	\N	\N
68	\N	CDL-2025-0063	MANDZA MAVOUNA Lucresse Férandia	Femme	1995-04-15	30	35	2060-04-15	2025-02-02	Bessieux						Infirmière Assistante	CDD	2025-05-01	Local	Gabon	Clinique	CDL	cadre de sant‚	\N	C‚libataire	0	Bac+2/3	0 ans 6 mois		Salaire	virement cdl	5	123100.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:25:01.569519	2025-08-13 14:33:33.887676			Actif	\N	\N	\N	\N	\N
151	contrat en cours	CDL-2024-0126	ONDO NDONG Gontran	Homme	1985-10-13	39	21	2045-10-31	2024-06-01	Bessieux			gontrant.ondo@centre-diagnostic.com			Agent de cotation	Prestataire	2025-03-01	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	0	Bac+2/3	0 ans 10 mois		Honoraires	virement cdl		0.00	\N	0.00	0.00	0.00	0.00	\N	\N	\N	\N	\N	180000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-07-01 07:43:47.68899			Actif	\N	\N	\N	\N	\N
157	Dossier … jour	CDL-2024-0132	POENOU DEMAGNA INNOCENT	Homme	1985-07-06	39	21	2045-07-31	2024-01-01	Bessieux	\N	\N	\N	\N	\N	Coursier administratif	Prestataire	2025-12-31	expatri‚	Togo	Direction G‚n‚rale	CDL	Directeur G‚n‚ral	Non-Cadre	C‚libataire	0	Niveau ‚l‚mentaire	1 ans 3 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	350000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-07-01 07:43:47.68899			Actif	\N	\N	\N	\N	\N
160	Dossier … completer	CDL-2024-0134	SAMO FOSSA	Homme	1990-11-11	34	26	2050-11-30	\N	Bessieux	\N	\N	\N	\N	\N	Manipulateur imagerie	prestataire	\N	Local	Gabon	Clinique	CDL	M‚decin chef	Non-Cadre	C‚libataire	0	… renseigner	125 ans 3 mois	\N	Honoraires	virement cdl	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	15000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-07-01 07:43:47.68899			Actif	\N	\N	\N	\N	\N
58	\N	CDL-2022-0053	KEMAYOU NANA Epse WANDJI DJOFANG Williane Nyna	Femme	1986-04-20	39	26	2051-04-20	2022-09-30	Bessieux					886-051-406-4	Infirmier(ère) polyvalente en cardio	Prestataire	2026-10-29	expatri‚	Cameroun	Clinique	CDL	InfirmiÈre Major	\N	Mari‚	3	Bac+2/3	2 ans 10 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	250000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:24:49.537174	2025-08-13 14:28:42.771778			Actif	\N	\N	\N	\N	\N
164	\N	CDL-2024-0138	SOUOP REGIS	Homme	1998-01-07	27	38	2063-01-07	2024-03-19	Bessieux						Médecin Généraliste de garde	Prestataire	2025-12-30	expatri‚	Cameroun	Clinique	CDL	M‚decin chef	\N	C‚libataire	0	Doctorat	1 ans 4 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-08-13 15:08:17.879714			Actif	\N	\N	\N	\N	\N
166	\N	CDL-2024-0139	THIOUNE MATOU	Femme	1997-02-08	28	37	2062-02-08	2024-04-30	Bessieux				001-1629320-0		Manipulateur imagérie	CDI	2025-10-30	Local	Gabon	Clinique	CDL	P“le imagerie	\N	C‚libataire	0	Bac+4/5 - Ing‚nieur-Master	1 ans 3 mois		Salaire	virement cdl	7	150000.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-08-13 15:08:37.251995			Actif	\N	\N	\N	\N	\N
167	\N	CDL-2023-0140	TOMFEU KUIDJEU Flory Dorcas	Femme	1995-03-08	30	35	2060-03-08	2023-02-20	Bessieux				001-1632379-1	972-813-048-8	Infirmier(ère)	CDI	\N	Local	Gabon	Clinique	CDL	InfirmiÈre Major	\N	C‚libataire	1	Bac+2/3	2 ans 5 mois		Salaire	virement cdl	7	150000.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-08-13 15:09:16.392404			Actif	\N	\N	\N	\N	\N
192	\N	CDL-2025-0159	MAGOSSOU MBADINGA	Homme	1988-08-27	36	23	2048-08-27	2025-10-10	AKIENI	\N	\N	\N	\N	\N	Technicien laboratoire	Local	2025-09-09	Prestataire	Gabon	Laboratoire	CDL	Responsable laboratoire	Non-Cadre	C‚libataire	0	Bac+4/5 - Ing‚nieur-Master	0 ans 0 mois	\N	Honoraires	Virement CDL	\N	0.00	\N	0.00	\N	0.00	0.00	\N	\N	\N	\N	\N	350000.00	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:54:18.235078	2025-07-01 07:54:18.235078			Actif	\N	\N	\N	\N	\N
11	\N	CDL-2024-0009	ANGONE EDOU Vasta	Femme	1991-08-29	33	32	2056-08-29	2024-10-20	Bessieux						Équipière polyvalente	CDD	2025-04-19	Local	Gabon	Wallya	WALHYA	Manager Healthcare	\N	C‚libataire	0	… renseigner	0 ans 9 mois		Salaire	Virement bancaire	5	123100.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 16:59:53.13335	2025-08-13 14:04:32.133935			Actif	\N	\N	\N	\N	\N
12	\N	CDL-2024-0010	ANGOUE EYENE Junior Lebrun Chanfort	Homme	1994-06-23	31	34	2059-06-23	2024-04-21	Bessieux						Infirmier	Prestataire	2025-12-20	Local	Gabon	Clinique	CDL	InfirmiÈre Major	\N	C‚libataire	0	Bac+2/3	1 ans 3 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	250000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 16:59:53.13335	2025-08-13 14:05:13.200536			Actif	\N	\N	\N	\N	\N
13	\N	CDL-2022-0011	ANGUE ELLA INES	Femme	1993-04-24	32	33	2058-04-24	2022-09-11	Bessieux				016-1465255-5	935-137-837-6	Infirmier(Ère)	CDI	\N	Local	Gabon	Clinique	CDL	InfirmiÈre Major	\N	C‚libataire	2	Niveau Bac	2 ans 11 mois		Salaire	virement cdl	7	150000.00	0.00	0.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 16:59:53.13335	2025-08-13 14:05:46.668793			Actif	\N	\N	\N	\N	\N
14	\N	CDL-2025-0012	AYITE KOKOUE Stéphanie Jacky	Femme	1992-11-28	32	33	2057-11-28	2025-01-27	Bessieux			stephanie.ayite@centre-diagnostic.com			Infirmière	Prestataire	2025-06-26	Local	Gabon	Clinique	CDL	Cadre de sant‚	\N	C‚libataire	0	Bac+3/4	0 ans 6 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 16:59:53.13335	2025-08-13 14:09:46.355751			Actif	\N	\N	\N	\N	\N
15	Dossier … completer	CDL-2024-0013	BADJINA MBOUMBA Ingrid	Femme	1992-10-13	32	28	2052-10-31	2024-08-27	Bessieux	\N	\N	\N	001-1680752-0	722-820-118-7	Agent d'accueil et facturation	CDD	2025-06-25	Local	Gabon	Accueil/Facturation	CDL	responsable accueil et facturation	Non-Cadre	C‚libataire	2	Bac+2/3	0 ans 7 mois	\N	Salaire	virement cdl	5	123100.00	5000.00	\N	\N	\N	35000.00	\N	25000.00	\N	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 16:59:53.13335	2025-06-30 16:59:53.13335			Actif	\N	\N	\N	\N	\N
28	Dossier complet	CDL-2023-0026	CISSE DIARRA FATOUMATA	Femme	1980-06-05	44	16	2040-06-30	2023-02-22	Bessieux	\N	\N	\N	001-1032263-3	360-766-248-4	Infirmier(Šre)	CDI	\N	Local	Gabon	Clinique	CDL	InfirmiŠre Major	Non-Cadre	Mari‚	3	Bac+2/3	2 ans 1 mois	\N	Salaire	virement cdl	\N	290000.00	27500.00	\N	50000.00	50000.00	35000.00	50000.00	\N	\N	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:15:03.442634	2025-06-30 17:15:03.442634			Actif	\N	\N	\N	\N	\N
73	\N	CDL-2025-0068	MAZAMBA Loic Thystère	Homme	1992-08-19	32	33	2057-08-19	2024-12-31	Bessieux			loic.mazamba@centre-diagnostic.com			Médecin généraliste	CDI	2025-06-29	Local	Gabon	Clinique	CDL		\N	C‚libataire	0	Doctorat	0 ans 7 mois		Honoraires	virement cdl		0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	1000000.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-06-30 17:19:44.074055	2025-08-13 14:37:07.791218			Actif	\N	\N	\N	\N	\N
111	Dossier … completer	CDL-2024-0093	NDZOUNDOU NDZOUNDOU Molby	Homme	1996-04-19	28	32	2056-04-30	2024-12-02	Bessieux	\N	\N	\N	001-1691949-9	294-179-454-7	Cuisinier	CDD	2025-06-01	Local	Gabon	Hotellerie/Hospitalit‚/Buanderie/Self	CDL	Responsable Accueil et Hospitalit‚	Non-Cadre	C‚libataire	2	Niveau Bac	0 ans 4 mois	\N	Salaire	virement cdl	7	153500.00	78611.00	\N	\N	\N	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:46.910981	2025-07-01 07:07:46.910981			Actif	\N	\N	\N	\N	\N
109	\N	CDL-2022-0091	NDEKAHANGOUE Célia	Femme	1990-09-15	34	31	2055-09-15	2022-03-31	Bessieux				001-1138021-8	236-044-073-3	Infirmier(ère) Major	Prestataire	\N	Local	Gabon	Clinique	CDL	M‚decin chef	\N	C‚libataire	2	Niveau ‚l‚mentaire	3 ans 4 mois		Salaire	virement cdl	7	150000.00	0.00	150000.00	0.00	0.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:07:16.968745	2025-08-13 14:46:13.093935			Actif	\N	\N	\N	\N	\N
140	Dossier complet	CDL-2021-0115	NZE ONDO Christelle	Femme	1983-05-25	41	19	2043-05-31	2021-09-01	Bessieux	\N	\N	\N	001-1078897-3	\N	Agent d'entretien	CDI	\N	Local	Gabon	Hotellerie/Hospitalit‚/Buanderie/Self	CDL	Responsable Accueil et Hospitalit‚	Non-Cadre	C‚libataire	4	Niveau Bac	3 ans 7 mois	\N	Salaire	virement cdl	4	120000.00	\N	\N	\N	\N	35000.00	\N	\N	\N	\N	\N	\N	\N	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:09:00.40689	2025-07-01 07:09:00.40689			Actif	\N	\N	\N	\N	\N
153	\N	CDL-2022-0128	ONGONE Marie Louisa Nathalie	Femme	1971-12-19	53	12	2036-12-19	2022-12-24	Bessieux				001-1648200-1		Infirmier(ère) d'état	CDI	\N	Local	Gabon	Clinique	CDL	InfirmiÈre Major	\N	C‚libataire	3	Bac+2/3	2 ans 7 mois		Salaire	virement cdl	C1	325000.00	0.00	0.00	0.00	100000.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:43:47.68899	2025-08-13 15:03:14.416707			Actif	\N	\N	\N	\N	\N
70	\N	CDL-2023-0065	MATAMBA NDEMBET Felie Reine Epse MBOUMBA	Femme	1992-10-29	32	33	2057-10-29	2023-11-06	Bessieux			felie.matamba@centre-diagnostic.com	016-1468723-3		Secrétaire médicale	CDD	2025-11-05	Local	Gabon	Laboratoire	CDL	M‚decin chef	\N	Mari‚	0	Bac+2/3	1 ans 9 mois		Salaire	Virement bancaire	AM1	194600.00	0.00	0.00	0.00	35000.00	35000.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	password123	\N	\N	\N	f	\N	2025-07-01 07:25:01.569519	2025-08-13 14:35:18.13633			Actif	\N	\N	\N	\N	\N
\.


--
-- TOC entry 5246 (class 0 OID 41376)
-- Dependencies: 242
-- Data for Name: evenements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evenements (id, name, date, location, description, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5262 (class 0 OID 67477)
-- Dependencies: 258
-- Data for Name: file_action_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.file_action_history (id, file_id, action_type, action_date, action_by, action_details, ip_address) FROM stdin;
1	1	upload	2025-08-22 16:08:36.382918	124	Fichier uploadé: Recap.pdf	::1
2	1	delete	2025-08-22 16:24:46.792311	0	Fichier supprimé: Recap.pdf	::1
3	2	upload	2025-08-22 16:28:45.121859	124	Fichier uploadé: Recap.pdf	::1
4	2	download	2025-08-22 17:07:30.127551	0	Fichier téléchargé: Recap.pdf	::1
\.


--
-- TOC entry 5260 (class 0 OID 67466)
-- Dependencies: 256
-- Data for Name: file_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.file_comments (id, file_id, commenter_id, comment_text, comment_date, is_internal) FROM stdin;
\.


--
-- TOC entry 5238 (class 0 OID 41309)
-- Dependencies: 234
-- Data for Name: historique_departs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historique_departs (id, nom, prenom, departement, statut, poste, date_depart, motif_depart, commentaire, date_creation, date_modification) FROM stdin;
1	AKOUROU	Diane	Hotellerie/Hospitalit‚/Buanderie/Self	Effectif propre	Agent d'entretien	2024-01-31	licenciement		2025-04-23 08:50:40	2025-04-23 08:50:40
4	KOMBILA			stagiaire	Stagiaire	2024-08-12	Autre (pr‚ciser dans commentaire)	Fin de stage	2025-04-23 08:50:40	2025-04-23 08:50:40
8	MENZAH M'ANGOUE BEKALE	Alvina		Prestataire		2024-08-30			2025-04-23 08:50:40	2025-04-23 08:50:40
10	MAPANGOU MIKALA	Simon	Clinique	Effectif propre	Medecin Generaliste	2024-09-05	licenciement	fraude certificat d'arrˆt = faute lourde	2025-04-23 08:50:40	2025-04-23 08:50:40
11	EYEANG NGUEMA			stagiaire	stagiaire	2024-09-09		fin de stage	2025-04-23 08:50:40	2025-04-23 08:50:40
15	ONGONO	Marcelle		Stagiaire	stagiaire	2024-09-17		fin de stage	2025-04-23 08:50:40	2025-04-23 08:50:40
19	BELINGA EMANE	Rose Valentine	laboratoire	stagiaire	stagiaire laboratoire	2024-10-05	Autre (pr‚ciser dans commentaire)	fin de stage	2025-04-23 08:50:40	2025-04-23 08:50:40
20	IGNANGA NGOUESSY	Christelle Anais	Accueil/Facturation	prestataire	Agent d'accueil et facturation	2024-10-11	licenciement		2025-04-23 08:50:40	2025-04-23 08:50:40
24	HOUENOU	Nicolas	clinique	prestataire	Infirmier	2024-10-30	licenciement		2025-04-23 08:50:40	2025-04-23 08:50:40
32	MOUSSOUNDA MBOUMBA	Berchrist	Accueil/Facturation	Effectif propre	Agent d'accueil et facturation	2024-11-30	D‚mission		2025-04-23 08:50:40	2025-04-23 08:50:40
49	NDIMANGOYE AMBOGO	Marie Reine	laboratoire	prestataire	TSBM	2025-03-16	Démission		2025-04-23 08:50:40	2025-08-22 13:20:38.229752
45	IROUNDA KOUDA	Nellya Doroth‚	Marketing et comminication	Effectif propre	Community manager	2025-03-02	Démission		2025-04-23 08:50:40	2025-08-22 13:20:47.040672
44	ZOUGOU TOVIGNON	Alice Claudia	Hotellerie/Hospitalit‚/Buanderie/Self	Effectif propre	Responsable Accueil	2025-02-28	Démission		2025-04-23 08:50:40	2025-08-22 13:20:56.876586
47	MVOUNDZA NDJINDJI	Ofilia	Laboratoire	prestataire	Responsable laoboratoire	2025-03-04	Autre	Fin de contrat	2025-04-23 08:50:40	2025-08-22 13:21:13.338702
43	MERE OKOWA	Isabelle Fanny	RH	Effectif propre	Responsable Capital Humain	2025-02-23	Démission		2025-04-23 08:50:40	2025-08-22 13:21:22.760352
42	HOUNDJI	Innocentia	informatique	effectif propre	Responsable informatique	2025-01-30	Démission		2025-04-23 08:50:40	2025-08-22 13:21:30.944234
41	MINKOUE OBIANG	Doleresse Davila	Achats/Stock	Effectif propre	Gestionnaire Achat et stock	2025-01-25	Autre	Non renouvellement	2025-04-23 08:50:40	2025-08-22 13:21:42.27928
37	BIDJO MALOUMBI	Grace	Clinique	prestataire	Medecin Generaliste	2024-12-30	Autre	fin de contrat	2025-04-23 08:50:40	2025-08-22 13:22:06.461473
36	BOUTSONA BOUKANDOU	Grace Noria	Marketing et comminication	stagiaire	Stagiaire Marketing et Commnunication	2024-12-26	Autre	Rupture de contrat	2025-04-23 08:50:40	2025-08-22 13:22:14.251305
34	TSOGHO	Doria	Clinique	prestataire	Medecin Generaliste	2024-11-29	Fin de contrat	fin de contrat	2025-04-23 08:50:40	2025-08-22 13:22:49.275485
2	MFOUNGUI	Wilson	Clinique	Stagiaire	agent comptable	2024-05-30	Autre	non renouvellement de contrat (accouchement)	2025-04-23 08:50:40	2025-08-22 13:23:22.983555
3	BULU	Raissa	Finance/Comptabilit‚	Prestataire	agent comptable	2024-08-01	Autre	non renouvellement de contrat	2025-04-23 08:50:40	2025-08-22 13:23:30.220918
13	KABIENI ANKOUSSOU	Marion	Clinique	Stagiaire	Stagiaire	2024-09-13	Autre	fin de stage	2025-04-23 08:50:40	2025-08-22 13:23:45.929684
6	NFONO NANG	Syntyche	Clinique	Effectif propre	Medecin Generaliste	2024-08-29	Démission		2025-04-23 08:50:40	2025-08-22 13:24:09.141814
7	NDONG ETOUGHE	Joseph	Clinique	Effectif propre	Stagiaire	2024-08-29	Autre	Fin de satge	2025-04-23 08:50:40	2025-08-22 13:24:19.461972
5	MBOUMBA PAMBOU	Rebecca Grace	Cotation	Effectif propre	Agent cotation	2024-08-27	Démission		2025-04-23 08:50:40	2025-08-22 13:24:27.508486
23	MATSAGA	Melissa	laboratoire	prestataire	Technicienne laboratoire	2024-10-27	Démission		2025-04-23 08:50:40	2025-08-22 13:25:11.988894
21	ENGO MVE	Loic	cuisine	prestataire	cuisinier	2024-10-20	Démission		2025-04-23 08:50:40	2025-08-22 13:25:19.558807
16	MOUNGUENGUI BOUTOTO	Brayanne	Compabilit‚	Stagiaire	Stagiaire comptable	2024-09-24	Autre	Fin de stage	2025-04-23 08:50:40	2025-08-22 13:25:45.538738
14	EKOVONE KAMBANGOYE ALLINI	Dominique Ericka	Accueil/Facturation	Effectif propre	Agent accueil et facturation	2024-09-16	Autre	p‚riode d'essai non concluante	2025-04-23 08:50:40	2025-08-22 13:25:54.058698
31	BATCHY NDOSSY	Solenne	hotellerie/Hospitalit‚/Buanderie/Self	Effectif propre	Commis de cuisine	2024-11-25	Démission		2025-04-23 08:50:40	2025-08-22 13:26:10.368299
28	NYINGONE BEKALE	Lindsay	Accueil/Facturation	Effectif propre	Agent d'accueil et facturation	2024-11-23	Démission		2025-04-23 08:50:40	2025-08-22 13:26:17.440665
26	MATSANGA FATOMBI	WARIDATH	clinique	Prestataire	Sage-femme	2024-11-11	Démission		2025-04-23 08:50:40	2025-08-22 13:26:24.165326
29	KUMILUNDE	Ruphanie	Accueil/Facturation	Effectif propre	Agent d'accueil et facturation	2024-11-25	Autre	fin de contrat	2025-04-23 08:50:40	2025-08-22 13:26:32.437243
30	MINKUE MI NDONG	Lexia Manouchera	Accueil/Facturation	Effectif propre	Agent d'accueil et facturation	2024-11-25	Autre	fin de contrat	2025-04-23 08:50:40	2025-08-22 13:26:39.218653
48	LEYEME DINE	Patience	clinique	effectif propre	Médecin généraliste	2025-03-28	Autre	Fin de contrat	2025-04-23 08:50:40	2025-08-29 14:31:45.363501
46	BOURAIMA	Aridath	Clinique	Effectif propre	Médecin généraliste	2025-03-02	Autre	Fin de contrat	2025-04-23 08:50:40	2025-08-29 14:32:43.964958
40	MENGUE MINTSA	Marie José	Clinique	stagiaire	stagiaire infirmière	2025-01-22	Rupture de contrat		2025-04-23 08:50:40	2025-08-29 14:33:03.839051
39	EYENG SINGUI	Marie-Lauraine	clinique	prestataire	Médecin Genéraliste de garde	2025-01-14	Autre	fin de contrat	2025-04-23 08:50:40	2025-08-29 14:33:22.056836
38	FETY	Elfried	Clinique	prestataire	Infirmière	2024-12-31	Autre	non renouvellement	2025-04-23 08:50:40	2025-08-29 14:33:34.608862
35	OHAMBE WEMBADJONGA	Marie Carole	clinique	prestataire	infirmière	2024-12-19	Démission		2025-04-23 08:50:40	2025-08-29 14:33:48.665746
33	NZEMBILOUBA MEYE	DAN	Informatique	effectif propre	Développeur full stack	2024-11-28	Autre	Fin de contrat	2025-04-23 08:50:40	2025-08-29 14:34:06.152788
27	ONDO ALLOGO	Sarah Guénaelle	clinique	Effectif propre	Médecin Généraliste	2024-11-19	Autre	fin de contrat	2025-04-23 08:50:40	2025-08-29 14:34:36.3841
25	MBOUMBA	Lisa olivia	Clinique	Prestataire	Infirmière assistante	2024-10-29	Autre	fin de contrat	2025-04-23 08:50:40	2025-08-29 14:34:51.87795
22	NGOLO MAYOMBO	Lenie	Wallyah	Effectif propre	Equipière polyvalente	2024-10-20	licenciement		2025-04-23 08:50:40	2025-08-29 14:35:12.187702
18	NDONG NGUEMA	Kelly epse TOMO	Laboratoire	Effectif propre	Secrétaire médicale	2024-09-28	Démission		2025-04-23 08:50:40	2025-08-29 14:36:18.641654
12	ENARA RADEMBINO	Georges Loris	Clinique	Effectif propre	Infirmier(ère)	2024-09-12	licenciement	fraude bon d'examen = faute lourde	2025-04-23 08:50:40	2025-08-29 14:36:44.014508
9	LOGA	Jéremie	Cotation	Effectif propre	Agent de saie et cotation	2024-09-03	Démission		2025-04-23 08:50:40	2025-08-29 14:43:31.184663
53	SAMBAT	Frantz Sebastien	Marketing et comminication		Consultant senior en marketing et communication	2025-05-13	Fin de contrat		2025-06-16 16:59:21	2025-06-16 17:03:56
56	BOUDENGO	Livia Ornella	RH	Effectif propre	Assistante RH	2025-07-08	Démission		2025-08-14 16:22:10.488243	2025-08-14 16:22:28.862753
50	FOULA PONGUI	Steevia Daryla	Cotation	effectif propre	Agent de saisie et cotation	2025-04-09	Démission		2025-04-23 08:50:40	2025-08-22 13:20:15.052842
52	AKOMA Epse NGUEMA OBAM	Grace	Clinique	Effectif propre	Chargée de la gestion et l'organisation des soins	2025-06-05	Démission		2025-06-16 16:57:57	2025-08-29 14:32:03.572227
57	NYAMBA NGUEMA	Elvane Léona	Accueil/Facturation	Effectif propre	Agent acceuil et facturation	2024-09-28	Démission		2025-08-29 14:40:57.237428	2025-08-29 14:40:57.237428
59	Erwin	OBAME Gad	Informatique	CDD	Développeur full stack	2025-08-10	Fin de contrat		2025-09-03 14:04:31.623725	2025-09-03 14:10:16.907039
60	Stanislas	MOUBILIGUI Hervé	Informatique	CDD	Développeur full stack	2025-08-10	Fin de contrat		2025-09-03 14:06:19.3767	2025-09-03 14:11:34.873381
61	Komi	SEDDOR Ephraim Mawuenyegan	Informatique	CDD	Développeur full stack	2025-08-10	Fin de contrat		2025-09-03 14:13:11.351702	2025-09-03 14:13:39.996498
62	Eric	NZIMBA NZIMBA Stéphane	Finance/Comptabilit‚	CDI	Comptable	2025-08-29	Démission		2025-09-03 14:16:02.34495	2025-09-03 14:16:27.812119
\.


--
-- TOC entry 5236 (class 0 OID 41291)
-- Dependencies: 232
-- Data for Name: historique_recrutement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historique_recrutement (id, nom, prenom, departement, motif_recrutement, date_recrutement, type_contrat, poste, superieur_hierarchique, date_creation, date_modification, cv_path, notes) FROM stdin;
1	MERE	OKOWA Isabelle	RH	Cr‚ation de poste	2024-07-19	CDD	Responsable capital Humain	Directeur G‚n‚rale	2025-04-23 07:39:13	2025-04-23 07:39:13	\N	\N
2	BOUDENGO	BAVEKOUMBOU Livia	RH	Remplacement	2024-07-26	CDD	Assistante Ressources Humaines	Responsable Capital Humain	2025-04-23 07:39:13	2025-04-23 07:39:13	\N	\N
3	RAMAROJAONA	HARIVELO Serge	Clinique	Cr‚ation de poste	2024-08-01	CDD	Pediatre	M‚decin Chef	2025-04-23 07:39:13	2025-04-23 07:39:13	\N	\N
6	ADA MENZOGHE	Ange Anicet	Achats/Stock	Cr‚ation de poste	2024-08-12	CDD	Coursier	Chef Comptable	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
7	KUMILUNDE MI-PAMBOU	Ruphanie	Accueil/Facturation	Remplacement	2024-08-26	CDD	Agent d'accueil et facturation	Responsable Accueil et facturation	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
8	MINKUE MI NDONG	Lexia	Accueil/Facturation	Remplacement	2024-08-26	CDD	Agent d'accueil et facturation	Responsable Accueil et facturation	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
9	MOUSSOUNDA M'BOUMBA	Berchrist	Accueil/Facturation	Remplacement	2024-08-26	CDD	Agent d'accueil et facturation	Responsable Accueil et facturation	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
11	NYINGONE BEKALE	Linsay	Accueil/Facturation	Remplacement	2024-08-26	CDD	Agent d'accueil et facturation	Responsable Accueil et facturation	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
12	NZANG OVONO	Catrina Lyse	Accueil/Facturation	Remplacement	2024-08-26	CDD	Agent d'accueil et facturation	Responsable Accueil et facturation	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
13	BATCHY NDOSSY	Solenne Ophelie	Hotellerie/Hospitalit‚/Buanderie/Self	Cr‚ation de poste	2024-08-29	CDD	Commis de cuisine	Manager healthcare	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
14	EMANE NGUIE	Gwenaelle Sthessy	RH	Cr‚ation de poste	2024-09-03	Stage	Stagiaire assistante rh	Responsable Capital Humain	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
16	BADJINA MBOUMBA	Ingrid	Accueil/Facturation	Remplacement	2024-09-26	CDD	Agent d'accueil et facturation	Responsable Accueil et facturation	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
17	DIVEMBA BOUKA	Lodie Esp‚rence	Accueil/Facturation	Remplacement	2024-09-26	CDD	Agent d'accueil et facturation	Responsable Accueil et facturation	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
18	KALUNGA BUBU BOY	Daesttee	Accueil/Facturation	Remplacement	2024-09-26	CDD	Agent d'accueil et facturation	Responsable Accueil et facturation	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
19	KOMBA MAYOMBO	Vivaldi	Accueil/Facturation	Remplacement	2024-09-26	CDD	Agent d'accueuil et facturation	Responsable Accueil et facturation	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
21	AKAGAH NDEMBA	Ang‚lique	Clinique	Cr‚ation de poste	2024-10-01	Prestation	Nephrologue	Medecin chef	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
24	ADA ACKWE	Myriame	Finance/Comptabilit‚	Remplacement	2024-10-01	CDD	Assistante comptable	Chef Comptable	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
25	OGOULA BEYA	Marina	Cotation	Remplacement	2024-10-01	CDD	Agent de saisie et cotation	Chef Comptable	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
27	KOGUET NZOUBA	Amanda Falone	Clinique	Basculement en CDD	2024-10-01	CDD	Assistante dentaire	Cadre de sant‚	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
28	TALY	Axelle Audrey	Clinique	Basculement en CDD	2024-10-01	CDD	Assistante dentaire	Cadre de sant‚	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
29	FOULA PONGUI	Steevia Steryla	Cotation	Remplacement	2024-10-05	CDD	Agent saisie et cotation	Chef Comptable	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
33	NKOGHO ETOUGHE BIYOGHE	Johan	Informatique	Cr‚ation de poste	2024-10-17	Stage PNPE	Stagiaire Developpeur Full Stack	Responsable IT	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
34	EYUI NDONG	MBA OBAME Pascale Gaelle	Clinique	cr‚ation de poste	2024-10-21	CDD	Sage-femme	M‚decin Chef	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
35	ANGONE EDOU	Vasta	Vente	Remplacement	2024-10-21	CDD	Vendeuse	Manager healthcare	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
36	MAHINDZA SAFIOU	Anzimath	Accueil/Facturation	Basculement en CDD	2024-11-06	CDD	Agent d'accueil et facturation	Responsable bureau des entr‚es	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
37	MBOUROU TAIKA	Gaelle Magline	Achats/Stock	Basculement en CDD	2024-11-12	CDD	Support achat et stock	Chef Comptable	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
38	MIKOLO KENENI	Henri	Hotellerie/Hospitalit‚/Buanderie/Self	remplacement	2024-11-18	CDD	Cuisinier	Responsable hotellerie	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
40	SAMBAT	Frantz S‚bastien	Marketing/Communication	Remplacement	2024-11-21	prestation	Consultant en Marketing	Directeur G‚n‚rale	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
44	NGAWOUMA		Clinique	Cr‚ation de poste	2024-11-24	Prestation	M‚decin G‚n‚raliste de garde	M‚decin chef	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
46	MAKOUNE	SOP	Clinique	Cr‚ation de poste	2024-11-24	Prestation	Médecin Généraliste de garde	Médecin chef	2025-04-23 08:03:01	2025-08-22 13:11:17.836377	\N	
32	EYA' AMA MVE	Robert	Clinique	Cr‚ation de poste	2024-10-13	Prestation	Gynéchologue obstétricien	Médecin Chef	2025-04-23 08:03:01	2025-08-22 13:11:47.727436	\N	
10	NYANGUI	Périnne	Accueil/Facturation	Remplacement	2024-08-25	CDD	Agent d'accueil et facturation	Responsable Accueil et facturation	2025-04-23 08:03:01	2025-08-22 13:12:21.091487	\N	
15	BOURAIMA	Aridath	Clinique	Cr‚ation de poste	2024-09-04	CDD	Médecin Généraliste	Médecin Chef	2025-04-23 08:03:01	2025-08-22 13:12:58.767634	\N	
22	MUSSIALY MPAMAH Cindy	Joy	Clinique	Cr‚ation de poste	2024-09-30	CDD	Infirmière	Infirmière majore	2025-04-23 08:03:01	2025-08-22 13:13:25.611431	\N	
43	PAMO	LATELA	Clinique	Cr‚ation de poste	2024-11-21	Prestation	M‚decin Généraliste de garde	Médecin chef	2025-04-23 08:03:01	2025-08-22 13:13:42.963652	\N	
31	HOUENASSI	Martin	Clinique	Cr‚ation de poste	2024-10-08	Prestation	Consultant Médical Senior	Directeur Générale	2025-04-23 08:03:01	2025-08-22 13:14:05.668958	\N	
39	SAVY ENAGNON	AKOHOUENDO	Laboratoire	cr‚ation de poste	2024-11-19	Prestation	Technicienne supérieure de biologie médicale	Responsable Laboratoire	2025-04-23 08:03:01	2025-08-22 13:14:23.520654	\N	
20	LEYEME Dine	Patience	Clinique	Remplacement	2024-09-30	CDD	Médecin Généraliste	Médecin Chef	2025-04-23 08:03:01	2025-08-22 13:14:39.990605	\N	
45	MALOUMBI	Grace	Clinique	cr‚ation de poste	2024-11-24	prestation	Médecin chef	Médecin chef	2025-04-23 08:03:01	2025-08-22 13:14:55.962342	\N	
30	OLLENDE	Crépin	Clinique	cr‚ation de poste	2024-10-06	prestation	Chirurgien viscéral	Médecin Chef	2025-04-23 08:03:01	2025-08-22 13:15:21.648358	\N	
42	ALOLI	Nathalie	Clinique	cr‚ation de poste	2024-11-21	prestation	Pédiatre	Médecin chef	2025-04-23 08:03:01	2025-08-22 13:15:36.981557	\N	
41	NGUEMA ELLA	Serghino	Hotellerie/Hospitalit‚/Buanderie/Self	Remplacement	2024-11-20	Prestation	Technicienne supérieure d'imagerie médicale	Médecin chef	2025-04-23 08:03:01	2025-08-22 13:15:57.57132	\N	
26	MBOUMBA Hervé	Bénédicte	Cotation	Remplacement	2024-09-30	CDD	Agent de saisie et cotation	Chef Comptable	2025-04-23 08:03:01	2025-08-22 13:16:30.329891	\N	
23	AKAGAH ADEMBA	Angélique	Clinique	Cr‚ation de poste	2024-09-30	Prestation	Nephrologue	Médecin Chef	2025-04-23 08:03:01	2025-08-22 13:16:51.887169	\N	
4	IROUNDA KOUDA Nelly	Dorothée	Informatique	Cr‚ation de poste	2024-07-31	CDD	Community Manager	Responsable marketing/communication	2025-04-23 07:39:13	2025-08-22 13:17:20.559265	\N	
49	MIKIMOU NDONG	Hans Huster	Laboratoire	Basculement en CDD	2024-12-01	CDD	Technicien laboratoire	Responsable laboratoire	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
50	NZOUNDOU NZOUNDOU	Molby	Hotellerie/Hospitalit‚/Buanderie/Self	Remplacement	2024-12-02	CDD	Cuisinier	Responsable hotellerie	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
51	NGOMA	Elie le Tchisbith	Clinique	cr‚ation de poste	2024-12-20	stage	stagiaire infirmier d'Etat polyvalent	Cadre de sant‚	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
52	NGUELI		Clinique	cr‚ation de poste	2024-12-20	stage	stagiaire infirmiere d'Etat polyvalent	Cadre de sant‚	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
53	MBENGUE		Clinique	cr‚ation de poste	2024-12-20	stage	stagiaire infirmiere d'Etat polyvalent	Cadre de sant‚	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
54	MENGUE MINTSA		Clinique	cr‚ation de poste	2024-12-20	stage	stagiaire infirmiere d'Etat polyvalent	Cadre de sant‚	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
55	NSEGHE NDONG	Gemima Peguy	Clinique	cr‚ation de poste	2024-12-20	stage	stagiaire infirmiere d'Etat polyvalent	Cadre de sant‚	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
57	DISSIYA DOLERA	Mistral	Accueil/Facturation	Basculement en CDD	2025-01-01	CDD	Agent d'accueil et facturation	Responsable bureau des entr‚es	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
58	DOUTSONA MFOUMBI	Loraine Merlik	Accueil/Facturation	Basculement en CDD	2025-01-01	CDD	Agent d'accueil et facturation	Responsable bureau des entr‚es	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
59	ABEGUE EDOU ABESSOLO	Pauline	Accueil/Facturation	Basculement en CDD	2025-01-01	CDD	Agent d'accueil et facturation	Responsable bureau des entr‚es	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
66	MVOUNDZA NDJINDJI	Ofilia	Clinique	cr‚ation de poste	2025-01-06	Prestation	Responsable laboratoire	Directeur G‚n‚rale	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
74	MENGUE MBA	Rudmina Gaelle	Clinique	cr‚ation de poste	2025-02-03	CDD	Sage-femme junior	Cadre de sant‚	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
80	OKOUDJI OKOGO	Han Fenett	Achats/Stock	remplacement	2025-03-03	CDD	Superviseur achat et stock	Chef Comptable	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
83	APEDO	Mensa Wilfried	Clinique	cr‚ation de poste	2025-03-19	Prestation	ophtalmologue	M‚decin chef	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
84	MIHINDOU	Juvenal	Clinique	cr‚ation de poste	2025-03-24	Prestation	Rhumatologue	M‚decin chef	2025-04-23 08:03:01	2025-04-23 08:03:01	\N	\N
93	BITOMBA	Anaick	Cotation	Remplacement	2025-05-07	Stage PNPE	Agent saisie et cotation	Chef comptable	2025-06-20 07:10:21	2025-06-20 07:10:21	\N	\N
94	ABASSEMA BAKENABENA	Nkouli-Nte	Laboratoire	Remplacement	2025-05-09	Prestation	Biologiste	Responsable laboratoire	2025-06-20 07:10:21	2025-06-20 07:10:21	\N	\N
95	MAGUIAKAM DOMTCHOUENG	Princesse	Clinique	Cr‚ation de poste	2025-04-22	Prestation	Médecin généraliste	M‚decin chef	2025-06-20 07:10:21	2025-08-22 12:58:04.136456	\N	
88	NGUIA NGUIA Clémence	Julie	Clinique	Remplacement	2025-04-19	Prestation	Médecin généraliste	M‚decin chef	2025-06-20 07:10:21	2025-08-22 12:58:49.489846	\N	
82	OLIVEIRA	Stephane	Clinique	cr‚ation de poste	2025-03-09	Prestation	Anesthesiste-réanimateur	M‚decin chef	2025-04-23 08:03:01	2025-08-22 12:59:03.821572	\N	
91	MOUNIEVI KOUONGA	Negg	Clinique	Remplacement	2025-04-15	CDD	Médecin généraliste	M‚decin chef	2025-06-20 07:10:21	2025-08-22 12:59:25.744918	\N	
90	MANFOUMBI	Aby-Lenz	Clinique	Remplacement	2025-04-10	Prestation	Médecin généraliste	M‚decin chef	2025-06-20 07:10:21	2025-08-22 12:59:50.075451	\N	
89	MBOULA	Pauline	Clinique	Remplacement	2025-04-10	Prestation	Médecin généraliste	M‚decin chef	2025-06-20 07:10:21	2025-08-22 13:00:11.518254	\N	
81	MOULOUAMOU Françoise	Yéni	Clinique	cr‚ation de poste	2025-03-09	Prestation	Pédiatre	M‚decin chef	2025-04-23 08:03:01	2025-08-22 13:00:51.068158	\N	
85	SONON	Aurel	Clinique	cr‚ation de poste	2025-02-28	Prestation	Gynéchologue obstétricien	M‚decin chef	2025-04-23 08:03:01	2025-08-22 13:01:22.673906	\N	
86	NKOGHE Claude	Valérie	Clinique	Remplacement	2025-02-28	Prestation	Pédiatre	Médecin chef	2025-04-23 08:03:01	2025-08-22 13:01:58.810865	\N	
78	MELO TECHE GHISLAINE	ARMELLE	Clinique	Cr‚ation de poste	2025-02-17	CDD	Médecin Cardiologue	Médecin Chef	2025-04-23 08:03:01	2025-08-22 13:02:25.550167	\N	
77	NAHHAS	Lorena	Hotellerie/Hospitalit‚/Buanderie/Self	Cr‚ation de poste	2025-02-16	Prestation	Chargée Qualité et Hygiène Hospitalière	Directeur Générale	2025-04-23 08:03:01	2025-08-22 13:02:54.091721	\N	
79	BOUSSIENGUI LISSOUMOU Mylène	Darcy	Vente	cr‚ation de poste	2025-02-19	CDD	Equipière polyvalente	Manager healthcare	2025-04-23 08:03:01	2025-08-22 13:03:16.857155	\N	
75	NKOHOM Théophil	Jacky	Clinique	remplacement	2025-02-06	CDD	Médecin généraliste	Médecin Chef	2025-04-23 08:03:01	2025-08-22 13:03:57.763754	\N	
73	MANDZA LAVOUNA Lucresse	Férandia	Clinique	cr‚ation de poste	2025-02-02	prestation	infirmière	Cadre de santé	2025-04-23 08:03:01	2025-08-22 13:04:23.681917	\N	
72	MATSANGA FATOMBI	Waridath	Clinique	Cr‚ation de poste	2025-01-29	Prestation	Infirmière	Cadre de santé	2025-04-23 08:03:01	2025-08-22 13:05:06.558439	\N	
60	NDOMINGIELO	Eldad	Informatique	Cr‚ation de poste	2025-01-01	CDD	Administrateur Système et Sécurité reseau	Responsable IT	2025-04-23 08:03:01	2025-08-22 13:05:28.59853	\N	
71	MPEMBA	Alida	Clinique	cr‚ation de poste	2025-01-28	prestation	infirmière	Cadre de santé	2025-04-23 08:03:01	2025-08-22 13:06:11.97978	\N	
70	AYITE	KAKOUE	Clinique	cr‚ation de poste	2025-01-27	prestation	infirmière	Cadre de santé	2025-04-23 08:03:01	2025-08-22 13:06:24.486269	\N	
69	NGONDOU	MARTINE	Clinique	Cr‚ation de poste	2025-01-26	Prestation	Infirmière	Cadre de santé	2025-04-23 08:03:01	2025-08-22 13:06:39.012823	\N	
76	DE SOUZA	Ovidio	Clinique	Cr‚ation de poste	2025-02-16	CDD	Médecin Radiologue	Médecin Chef	2025-04-23 08:03:01	2025-08-22 13:06:54.723493	\N	
62	MOUNDOUNGA	Ruth	Accueil/Facturation	cr‚ation de poste	2025-01-01	CDD	Secrétaire médicale	responsable bureau des entrées	2025-04-23 08:03:01	2025-08-22 13:07:41.010872	\N	
67	NTOUTOUME ANGOUE Marie	Thérèse	Clinique	Cr‚ation de poste	2025-01-13	CDD	Infirmière	Cadre de santé	2025-04-23 08:03:01	2025-08-22 13:07:51.848056	\N	
65	AKOMA ODZAGA	Grace	Clinique	cr‚ation de poste	2025-01-05	CDD	Cadre de santé	Directeur Générale	2025-04-23 08:03:01	2025-08-22 13:08:24.289829	\N	
64	OBAME ASSOUMOU	Victor	Clinique	cr‚ation de poste	2025-01-05	CDD	Médecin Généraliste	Médecin Chef	2025-04-23 08:03:01	2025-08-22 13:08:49.129804	\N	
63	MBIA	NDZALE	Clinique	cr‚ation de poste	2025-01-01	CDD	infirmière	Cadre de santé	2025-04-23 08:03:01	2025-08-22 13:09:04.46188	\N	
61	MAZAMBA Loic	Thystère	Clinique	cr‚ation de poste	2025-01-01	prestation	Médecin Généraliste	Médecin Chef	2025-04-23 08:03:01	2025-08-22 13:09:31.066743	\N	
56	EYENG SINGUI Marie	Lauraine	Clinique	Cr‚ation de poste	2024-12-20	Prestation	Médecin généraliste	Médecin Chef	2025-04-23 08:03:01	2025-08-22 13:09:56.752368	\N	
48	TSOGHO	DORIA	Clinique	Cr‚ation de poste	2024-11-29	Prestation	Médecin Généraliste	Médecin chef	2025-04-23 08:03:01	2025-08-22 13:10:32.522639	\N	
96	TSHIBOLA MBUYI	Mari Louisa	Laboratoire	Remplacement	2025-05-12	Prestation	Responsable laboratoire	Directeur des Affaires M‚dicales/ directeur g‚n‚ral	2025-06-20 07:10:21	2025-06-20 07:10:21	\N	\N
97	MATEYA	Ghislain Hermann	RH	Remplacement	2025-06-02	CDD	Responsable rh	Directeur g‚n‚ral	2025-06-20 07:10:21	2025-06-20 07:10:21	\N	\N
101	PONGUI	Ulrich	Laboratoire	Remplacement	2025-06-10	CDD	Technicien laboratoire	Responsable laboratoire	2025-06-20 07:10:21	2025-06-20 07:10:21	\N	\N
103	NDE KEGNE	Valdy	Laboratoire	Cr‚ation de poste	2025-06-10	CDD	Technicien laboratoire	Responsable laboratoire	2025-06-20 07:10:21	2025-06-20 07:10:21	\N	\N
104	NKENE BEKA	Alliance Josiane	Laboratoire	Cr‚ation de poste	2025-06-10	CDD	Technicienne laboratoire	Responsable laboratoire	2025-06-20 07:10:21	2025-06-20 07:10:21	\N	\N
106	EYI ASSOUMOU	Flanel	Clinique	Cr‚ation de poste	2025-06-10	CDD	Infirmier	cadre de sant‚	2025-06-20 07:10:21	2025-06-20 07:10:21	\N	\N
109	DJOGNOU KUITCHOU	Jessica	Laboratoire	Cr‚ation de poste	2025-06-10	Prestation	Technicienne laboratoire	responsable laboratoire	2025-06-20 07:10:21	2025-06-20 07:10:21	\N	\N
107	ILOMBE NDENDI	Laeticia	Clinique	Cr‚ation de poste	2025-06-09	CDD	Infirmière	cadre de sant‚	2025-06-20 07:10:21	2025-08-22 12:56:31.050068	\N	
108	MAGOSSO MBADINGA	Marien	Laboratoire	Création de poste	2025-06-09	Prestation	Technicien laboratoire	responsable	2025-06-20 07:10:21	2025-08-22 12:56:42.863567	\N	
105	MADOUNGOU	Beverlie	Clinique	Cr‚ation de poste	2025-06-09	CDD	Infirmière	cadre de sant‚	2025-06-20 07:10:21	2025-08-22 12:56:55.798304	\N	
92	BOUSSOUGHOU MOMBO Aimé	Fridolin	Hotellerie/Hospitalit‚/Buanderie/Self	Remplacement	2025-05-11	CDD	Responsable QHSE	Directeur g‚n‚ral	2025-06-20 07:10:21	2025-08-22 12:57:13.51874	\N	
100	MOUBILIGUI Hervé	Stanislas	Informatique	Cr‚ation de poste	2025-05-11	Prestation	Développeur full stack	Directeur G‚n‚ral	2025-06-20 07:10:21	2025-08-22 12:57:31.735732	\N	
98	SEDDOR	Ephraim	Informatique	Cr‚ation de poste	2025-05-11	CDD	Développeur full stack	Directeur g‚n‚ral	2025-06-20 07:10:21	2025-08-22 12:58:15.659526	\N	
99	OBAME Gad	Erwin	Informatique	Cr‚ation de poste	2025-05-11	CDD	Développeur full stack	Directeur g‚n‚ral	2025-06-20 07:10:21	2025-08-22 12:58:27.672412	\N	
68	NGONDET MASSANDE	Sandra	Clinique	cr‚ation de poste	2025-01-25	prestation	infirmière	Cadre de santé	2025-04-23 08:03:01	2025-08-22 13:07:23.183884	\N	
47	ONGOUTA	MAFIA	Clinique	Cr‚ation de poste	2024-11-25	Prestation	Médecin Généraliste	Médecin chef	2025-04-23 08:03:01	2025-08-22 13:10:55.369563	\N	
112	NKOMA TCHIKA Paule	winnya	Marketing	Création de poste	2024-07-22	Stage PNPE	Stagiaire assistante projet	Formation	2025-08-22 13:18:57.034037	2025-08-22 13:18:57.034037	\N	
102	NIANGUI MBIKA	Charmélia	Clinique	Création de poste	2025-06-09	Stage PNPE	Infirmière	cadre de santé	2025-06-20 07:10:21	2025-09-03 09:37:01.715104	\N	
5	IGOUHET YENO Tatiana	Valérie	Finance/Comptabilit‚	Cr‚ation de poste	2024-07-30	CDI	Caissière principale	Chef Comptable	2025-04-23 07:39:13	2025-09-03 09:40:42.505283	\N	
\.


--
-- TOC entry 5268 (class 0 OID 76031)
-- Dependencies: 264
-- Data for Name: hr_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hr_tasks (id, title, description, priority, status, assigned_to, due_date, category, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5266 (class 0 OID 76018)
-- Dependencies: 262
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interviews (id, candidate_name, "position", interview_date, interview_time, interviewer, status, notes, created_at, updated_at, duration, interview_type, location, department) FROM stdin;
\.


--
-- TOC entry 5288 (class 0 OID 92316)
-- Dependencies: 284
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_id, sender_name, sender_type, receiver_id, receiver_name, receiver_type, content, "timestamp", is_read, created_at) FROM stdin;
23	1	Service RH	rh	124	NKOMA TCHIKA Paule Winnya	employee	Bonjour mme Paule	2025-09-20 10:36:32.223363	f	2025-09-20 10:36:32.223363
24	124	NKOMA TCHIKA Paule Winnya	employee	1	Service RH	rh	Boujour service rh	2025-09-20 10:36:57.649568	f	2025-09-20 10:36:57.649568
25	1	Service RH	rh	124	NKOMA TCHIKA Paule Winnya	employee	veuillez passez dans nos bureaux svp	2025-09-20 10:37:46.150663	f	2025-09-20 10:37:46.150663
26	124	NKOMA TCHIKA Paule Winnya	employee	1	Service RH	rh	je monte de suite	2025-09-20 10:42:24.585306	f	2025-09-20 10:42:24.585306
27	124	NKOMA TCHIKA Paule Winnya	employee	1	Service RH	rh	bonjour	2025-09-20 10:52:45.604319	f	2025-09-20 10:52:45.604319
28	124	NKOMA TCHIKA Paule Winnya	employee	1	Service RH	rh	bonjour	2025-09-20 10:57:03.044347	f	2025-09-20 10:57:03.044347
29	1	ABEGUE EDOU ABESSOLO Pauline	employee	1	Service RH	rh	Bonjour, j'aimerais prendre des congés la semaine prochaine.	2025-09-20 10:59:42.703679	f	2025-09-20 10:59:42.703679
30	1	ABEGUE EDOU ABESSOLO Pauline	employee	1	Service RH	rh	Pouvez-vous me confirmer si c'est possible ?	2025-09-20 10:59:42.736426	f	2025-09-20 10:59:42.736426
31	1	Service RH	rh	1	ABEGUE EDOU ABESSOLO Pauline	employee	Bonjour Pauline, nous allons examiner votre demande.	2025-09-20 10:59:42.740241	t	2025-09-20 10:59:42.740241
32	1	NKOMA TCHIKA Paule Winnya	employee	1	Service RH	rh	Bonjour, j'ai une question sur mon contrat.	2025-09-20 10:59:42.742118	f	2025-09-20 10:59:42.742118
33	1	Service RH	rh	124	NKOMA TCHIKA Paule Winnya	employee	bonjour	2025-09-20 11:15:42.824875	f	2025-09-20 11:15:42.824875
\.


--
-- TOC entry 5248 (class 0 OID 41390)
-- Dependencies: 244
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notes (id, full_note_number, category, title, content, is_public, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5250 (class 0 OID 59298)
-- Dependencies: 246
-- Data for Name: offboarding_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offboarding_history (id, employee_id, date_depart, motif_depart, checklist, documents, notes, created_at) FROM stdin;
6	187	2025-08-14	Test d'offboarding	{"acces_revoque": true, "materiel_retourne": true, "documents_recuperes": true}	{}	Test de l'endpoint	2025-08-14 16:30:48.147
7	23	2025-07-08	Démission	{"calcul_solde": true, "acces_revoque": false, "cles_retournees": true, "entretien_sortie": false, "inventaire_bureau": false, "materiel_retourne": true, "documents_recuperes": true, "formation_transfert": true}	{}		2025-08-14 16:32:10.664
8	188	2025-08-14	Test d'offboarding - Employé 188	{"acces_revoque": true, "materiel_retourne": true, "documents_recuperes": true}	{}	Test de l'endpoint avec employé 188	2025-08-14 16:40:24.672
9	199	2025-09-03	autre opportunité	{"calcul_solde": true, "acces_revoque": true, "cles_retournees": true, "entretien_sortie": true, "inventaire_bureau": true, "materiel_retourne": true, "documents_recuperes": true, "formation_transfert": true}	{}		2025-09-03 12:02:26.445
10	191	2025-08-10	Fin de contrat	{"calcul_solde": true, "acces_revoque": false, "cles_retournees": false, "entretien_sortie": false, "inventaire_bureau": false, "materiel_retourne": true, "documents_recuperes": true, "formation_transfert": false}	{}		2025-09-03 15:01:49.62
11	189	2025-08-10	Fin de contrat	{"calcul_solde": true, "acces_revoque": false, "cles_retournees": false, "entretien_sortie": false, "inventaire_bureau": false, "materiel_retourne": true, "documents_recuperes": true, "formation_transfert": false}	{}		2025-09-03 15:05:57.697
12	190	2025-08-10	Fin de contrat	{"calcul_solde": true, "acces_revoque": false, "cles_retournees": false, "entretien_sortie": false, "inventaire_bureau": false, "materiel_retourne": true, "documents_recuperes": true, "formation_transfert": false}	{}		2025-09-03 15:12:47.278
13	141	2025-08-29	Démission	{"calcul_solde": true, "acces_revoque": true, "cles_retournees": true, "entretien_sortie": false, "inventaire_bureau": false, "materiel_retourne": true, "documents_recuperes": true, "formation_transfert": false}	{}		2025-09-03 15:15:43.818
\.


--
-- TOC entry 5272 (class 0 OID 84131)
-- Dependencies: 268
-- Data for Name: onboarding_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.onboarding_history (id, employee_id, date_integration, checklist, documents, notes, created_at) FROM stdin;
1	196	2025-09-01	{"acces_configure": true, "contrat_signature": true, "documents_verifies": true, "formation_initiale": true, "presentation_equipe": true}	{documents-1756891766816-302323113.pdf}		2025-09-03 10:29:26.889
2	199	2025-09-01	{"acces_configure": true, "contrat_signature": true, "documents_verifies": true, "formation_initiale": true, "presentation_equipe": true}	{documents-1756897197180-406586088.pdf}		2025-09-03 11:59:57.351
\.


--
-- TOC entry 5282 (class 0 OID 84209)
-- Dependencies: 278
-- Data for Name: procedure_commentaires; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procedure_commentaires (id, dossier_id, admin_id, commentaire, type, date_creation) FROM stdin;
1	7	1	Commentaire de test pour le portail médical	note	2025-09-04 10:09:40.861306
\.


--
-- TOC entry 5278 (class 0 OID 84170)
-- Dependencies: 274
-- Data for Name: procedure_documents_requis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procedure_documents_requis (id, etape_id, nom_document, description, obligatoire, ordre, created_at) FROM stdin;
1	1	diplome	Diplôme de médecine (original et copie)	t	1	2025-09-04 09:30:16.05388
2	1	piece_identite	Pièce d'identité (passeport)	t	2	2025-09-04 09:30:16.05388
3	1	releves_notes	Relevés de notes	t	3	2025-09-04 09:30:16.05388
4	1	acte_naissance	Acte de naissance	t	4	2025-09-04 09:30:16.05388
5	2	diplome_authentifie	Diplômes authentifiés par l'ambassade	t	1	2025-09-04 09:30:16.05388
6	2	attestation_ambassade	Attestation d'authentification	t	2	2025-09-04 09:30:16.05388
7	3	demande_homologation	Demande d'homologation complète	t	1	2025-09-04 09:30:16.05388
8	3	attestation_homologation	Attestation d'homologation	t	2	2025-09-04 09:30:16.05388
9	4	inscription_cnom	Inscription au CNOM	t	1	2025-09-04 09:30:16.05388
10	4	carte_professionnelle	Carte professionnelle	t	2	2025-09-04 09:30:16.05388
11	5	autorisation_exercer	Autorisation d'exercer	t	1	2025-09-04 09:30:16.05388
12	6	autorisation_travail	Autorisation de travail	t	1	2025-09-04 09:30:16.05388
\.


--
-- TOC entry 5280 (class 0 OID 84187)
-- Dependencies: 276
-- Data for Name: procedure_documents_soumis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procedure_documents_soumis (id, dossier_id, document_requis_id, nom_fichier, chemin_fichier, taille_fichier, type_mime, statut, commentaire, date_soumission, date_validation, valide_par, created_at) FROM stdin;
\.


--
-- TOC entry 5274 (class 0 OID 84141)
-- Dependencies: 270
-- Data for Name: procedure_dossiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procedure_dossiers (id, nom, prenom, email, telephone, nationalite, specialite, universite, diplome_pays, statut, date_creation, derniere_modification, commentaire, lien_acces, token_acces, date_expiration_token, created_at, updated_at) FROM stdin;
7	Test	Médecin	test.medecin@example.com	+33 6 00 00 00 00	Française	Médecine générale	Université de Test	France	nouveau	2025-09-04 10:09:40.824231	2025-09-04 10:09:40.863189	Dossier de test pour le portail médical	http://localhost:3000/medical-access/8615786f254ac88c17c171a43d4e1f85b9b357f675b13dd04e7bb6d10cb46534	8615786f254ac88c17c171a43d4e1f85b9b357f675b13dd04e7bb6d10cb46534	2025-10-04 11:09:40.812	2025-09-04 10:09:40.824231	2025-09-04 10:09:40.824231
\.


--
-- TOC entry 5276 (class 0 OID 84157)
-- Dependencies: 272
-- Data for Name: procedure_etapes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procedure_etapes (id, nom, titre, couleur, ordre, next_step, description, created_at) FROM stdin;
1	nouveau	Dossier créé	primary	1	authentification	Dossier initial créé par l'administrateur	2025-09-04 09:30:16.046556
2	authentification	Authentification des diplômes	warning	2	homologation	Vérification et authentification des diplômes par l'ambassade	2025-09-04 09:30:16.046556
3	homologation	Demande d'homologation	info	3	cnom	Demande d'homologation des diplômes	2025-09-04 09:30:16.046556
4	cnom	Enregistrement CNOM	purple	4	autorisation_exercer	Enregistrement au Conseil National de l'Ordre des Médecins	2025-09-04 09:30:16.046556
5	autorisation_exercer	Autorisation d'exercer	success	5	autorisation_travail	Autorisation d'exercer la médecine	2025-09-04 09:30:16.046556
6	autorisation_travail	Autorisation de travail	success	6	\N	Autorisation de travail finale	2025-09-04 09:30:16.046556
\.


--
-- TOC entry 5284 (class 0 OID 84225)
-- Dependencies: 280
-- Data for Name: procedure_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procedure_notifications (id, dossier_id, type, destinataire, sujet, contenu, statut, date_envoi, date_reception, created_at) FROM stdin;
1	7	lien_acces	test.medecin@example.com	Accès à votre dossier médical	Votre dossier a été créé. Accédez-y via ce lien: http://localhost:3000/medical-access/8615786f254ac88c17c171a43d4e1f85b9b357f675b13dd04e7bb6d10cb46534	envoye	2025-09-04 10:09:40.824231	\N	2025-09-04 10:09:40.824231
\.


--
-- TOC entry 5286 (class 0 OID 84242)
-- Dependencies: 282
-- Data for Name: procedure_statistiques; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procedure_statistiques (id, date_statistique, total_dossiers, nouveaux_dossiers, en_cours, completes, created_at) FROM stdin;
\.


--
-- TOC entry 5254 (class 0 OID 59318)
-- Dependencies: 250
-- Data for Name: recrutement_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recrutement_history (id, employee_id, date_recrutement, date_fin, poste_recrute, type_contrat, salaire_propose, source_recrutement, statut, created_at, updated_at, notes) FROM stdin;
2	5	2023-07-23	\N	Sécrétaire médicale	Prestataire	\N	\N	Recruté	2025-08-14 16:29:00.283	2025-08-14 16:29:00.283	\N
3	8	2024-12-01	\N	Technicien supérieur de biologie médicale	CDD	\N	\N	Recruté	2025-08-14 16:29:00.284	2025-08-14 16:29:00.284	\N
4	6	2024-01-01	\N	VP-Médecin réanimateur anesthésiste	Prestataire	\N	\N	Recruté	2025-08-14 16:29:00.285	2025-08-14 16:29:00.285	\N
5	9	2022-10-31	\N	Technicien supérieur en imagerie médicale	CDI	\N	\N	Recruté	2025-08-14 16:29:00.285	2025-08-14 16:29:00.285	\N
6	1	2024-12-31	\N	Agent d'accueil et facturation	CDD	\N	\N	Recruté	2025-08-14 16:29:00.286	2025-08-14 16:29:00.286	\N
7	3	2024-10-01	\N	Assistante comptable	CDD	\N	\N	Recruté	2025-08-14 16:29:00.286	2025-08-14 16:29:00.286	\N
8	10	2024-06-25	\N	Médecin généraliste	Prestataire	\N	\N	Recruté	2025-08-14 16:29:00.287	2025-08-14 16:29:00.287	\N
9	19	2024-02-21	\N	Secrétaire médicale	CDI	\N	\N	Recruté	2025-08-14 16:29:00.287	2025-08-14 16:29:00.287	\N
10	20	2022-02-28	\N	Médecin Généraliste de garde	Prestataire	\N	\N	Recruté	2025-08-14 16:29:00.288	2025-08-14 16:29:00.288	\N
11	57	2023-10-13	\N	Agent call center	CDD	\N	\N	Recruté	2025-08-14 16:29:00.288	2025-08-14 16:29:00.288	\N
12	17	2023-02-01	\N	Infirmier(Šre)	CDI	\N	\N	Recruté	2025-08-14 16:29:00.288	2025-08-14 16:29:00.288	\N
13	18	2023-09-18	\N	Agent d'accueil et facturation	CDD	\N	\N	Recruté	2025-08-14 16:29:00.289	2025-08-14 16:29:00.289	\N
14	16	2021-06-15	\N	Biologiste	Prestataire	\N	\N	Recruté	2025-08-14 16:29:00.29	2025-08-14 16:29:00.29	\N
15	21	2024-12-07	\N	Secrétaire médicale	CDD	\N	\N	Recruté	2025-08-14 16:29:00.29	2025-08-14 16:29:00.29	\N
16	51	2024-06-25	\N	Agent d'entretien	Prestataire	\N	\N	Recruté	2025-08-14 16:29:00.29	2025-08-14 16:29:00.29	\N
17	122	2024-10-12	\N	Developpeur full stack	CDD	\N	\N	Recruté	2025-08-14 16:29:00.291	2025-08-14 16:29:00.291	\N
18	22	2021-10-01	\N	Responsable Cotation	CDI	\N	\N	Recruté	2025-08-14 16:29:00.291	2025-08-14 16:29:00.291	\N
20	24	2023-07-01	\N	Agent d'accueil et facturation	CDI	\N	\N	Recruté	2025-08-14 16:29:00.292	2025-08-14 16:29:00.292	\N
19	23	2024-07-26	2025-07-08	Assistante Ressources Humaines	CDD	\N	\N	Parti	2025-08-14 16:29:00.292	2025-08-14 16:32:10.666	Départ le 2025-07-08 (Démission)
21	196	2025-09-01	\N	Assistante rh	CDD	250000.00	Onboarding direct	Recruté	2025-09-03 10:29:26.893	2025-09-03 09:29:26.824479	Recrutement via processus d'onboarding
22	199	2025-09-01	2025-09-03	Assistante rh	CDD	250000.00	Onboarding direct	Parti	2025-09-03 11:59:57.354	2025-09-03 12:02:26.455	Départ le 2025-09-03 (autre opportunité)
1	4	2024-08-11	2025-09-03	Coursier	CDD	\N	\N	Parti	2025-08-14 16:29:00.27	2025-09-03 12:22:20.634	Départ le 2025-09-03 (Test d'offboarding - Employé supprimé)
\.


--
-- TOC entry 5258 (class 0 OID 67455)
-- Dependencies: 254
-- Data for Name: request_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_files (id, request_id, file_name, original_name, file_path, file_size, file_type, upload_date, uploaded_by, description, is_approved, approval_date, approved_by, approval_comments) FROM stdin;
2	3	request-undefined-1755880125081-732590515.pdf	Recap.pdf	C:\\Users\\hp\\sirh\\backend\\uploads\\request-files\\request-undefined-1755880125081-732590515.pdf	95661	application/pdf	2025-08-22 16:28:45.105437	124		f	\N	\N	\N
\.


--
-- TOC entry 5244 (class 0 OID 41360)
-- Dependencies: 240
-- Data for Name: sanctions_table; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sanctions_table (id, nom_employe, type_sanction, contenu_sanction, date, statut, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5270 (class 0 OID 84113)
-- Dependencies: 266
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, assignee, priority, status, due_date, category, estimated_hours, progress, notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5240 (class 0 OID 41326)
-- Dependencies: 236
-- Data for Name: visites_medicales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visites_medicales (id, nom, prenom, poste, date_derniere_visite, date_prochaine_visite, statut, notes, date_creation, date_modification) FROM stdin;
1	ADA MENZOGHE	Ange Anicet	Coursier	2024-08-14	2025-08-13	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
2	BADJINA MBOUMBA	Ingrid	Agent d'accueil et facturation	2024-09-11	2025-09-10	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
3	NYINGONE BEKALE	Linsay	Agent d'accueil et facturation	2024-09-11	2025-09-10	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
4	NZANG OVONO	Catrina lyse	Agent d'accueil et facturation	2024-09-11	2025-09-10	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
5	KALUNGA BUBU BOY	Daestee	Agent d'accueil et facturation	2024-09-26	2025-09-25	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
6	MINKUE MI NDONG	Lexia	Agent d'accueil et facturation	2024-09-11	2025-09-10	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
7	EMANE NGUIE	Gwenaelle Sthessy	Stagiaire assistante Rh	2024-09-11	2025-09-10	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
8	MOUSSOUNDA MBOUMBA	Berchrist	Agent d'accueil et facturation	2024-09-25	2025-09-24	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
9	KOMBA MAYOMBO AMIAR	Vivaldie	Agent d'accueil et facturation	2024-09-13	2025-09-12	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
10	DIVEMBA BOUKA	Lodie Esp‚rence	Agent d'accueil et facturation	2024-09-11	2025-09-10	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
11	IGOUHET YENO	Tatiana Val‚rie	CaissiŠre principale	2024-09-11	2025-09-10	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
12	NYANGUI	Perrine	Agent d'accueil et facturation	2024-09-11	2025-09-10	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
13	KUMILUDE	Ruphanie	Agent d'accueil et facturation	2024-09-11	2025-09-10	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
14	NDZOUNDOU NDZOUNDOU	Molby	Cuisinier	2025-01-13	2026-01-12	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
15	MOUKOUMOU ILINDI	Tr‚cy	Agent d'accueil et facturation	2025-01-14	2026-01-13	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
16	GONDJOUT	Fran	Agent Saisie et cotation	2025-01-13	2026-01-12	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
17	BIVIGOU DICKOBOU		Secr‚taire m‚dicale	2025-01-13	2026-01-12	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
18	NDOMINGIELO NGUIYA	Eldad	Admin. SystŠm. Et s‚curit‚ r‚seau	2025-01-14	2026-01-13	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
19	DOUTSONA BOUASSA	Evy	Sage-femme	2025-01-13	2026-01-12	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
20	ABEGUE EDOU ABESSOLO	Pauline	Agent d'accueil et facturation	2025-02-01	2026-02-01	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
21	DISSIYA DOLERA	Mistral	Agent d'accueil et facturation	2025-01-14	2026-01-13	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
22	NGOMA MAOUNDI	Elie le Tchisbith	Infirmier stagiaire	2025-01-14	2026-01-13	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
23	AKOMA ODZAGA	Grace	Cadre de sant‚	2025-01-13	2026-01-12	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
24	ANGONE EDOU	Vasta	EquiupiŠre polyvalente	2025-01-13	2026-01-13	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
25	MIHINDOU Epse EYENE NZE	Carmen	Agent d'accueil et facturation	2025-02-10	2026-02-12	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
26	MOUNDOUNGA	Ruth	Secr‚taire m‚dicale	2025-02-13	2026-02-12	A venir	\N	2025-04-23 10:09:12	2025-04-23 10:09:12
\.


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

