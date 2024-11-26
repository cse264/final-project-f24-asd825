PGDMP         7             
    |            CSE264Project    15.4    15.4 $                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            !           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            "           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            #           1262    16515    CSE264Project    DATABASE     �   CREATE DATABASE "CSE264Project" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE "CSE264Project";
                postgres    false            �            1259    16566    movie    TABLE     +  CREATE TABLE public.movie (
    id integer NOT NULL,
    tmdb_id integer NOT NULL,
    title character varying(255) NOT NULL,
    overview text,
    release_date date,
    runtime integer,
    rating numeric(3,2),
    vote_count integer,
    poster_path character varying(255),
    genres text[]
);
    DROP TABLE public.movie;
       public         heap    postgres    false            �            1259    16565    movie_id_seq    SEQUENCE     �   CREATE SEQUENCE public.movie_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.movie_id_seq;
       public          postgres    false    221            $           0    0    movie_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.movie_id_seq OWNED BY public.movie.id;
          public          postgres    false    220            �            1259    16517    user    TABLE     @  CREATE TABLE public."user" (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    user_type character varying(50) DEFAULT 'user'::character varying NOT NULL
);
    DROP TABLE public."user";
       public         heap    postgres    false            �            1259    16516    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    215            %           0    0    users_id_seq    SEQUENCE OWNED BY     >   ALTER SEQUENCE public.users_id_seq OWNED BY public."user".id;
          public          postgres    false    214            �            1259    16541    watchedlist    TABLE       CREATE TABLE public.watchedlist (
    id integer NOT NULL,
    tmdb_id integer NOT NULL,
    title character varying(255) NOT NULL,
    rating integer,
    user_id integer NOT NULL,
    CONSTRAINT watchedlist_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);
    DROP TABLE public.watchedlist;
       public         heap    postgres    false            �            1259    16540    watchedlist_id_seq    SEQUENCE     �   CREATE SEQUENCE public.watchedlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.watchedlist_id_seq;
       public          postgres    false    217            &           0    0    watchedlist_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.watchedlist_id_seq OWNED BY public.watchedlist.id;
          public          postgres    false    216            �            1259    16554    wishlist    TABLE     �   CREATE TABLE public.wishlist (
    id integer NOT NULL,
    tmdb_id integer NOT NULL,
    title character varying(255) NOT NULL,
    user_id integer NOT NULL
);
    DROP TABLE public.wishlist;
       public         heap    postgres    false            �            1259    16553    wishlist_id_seq    SEQUENCE     �   CREATE SEQUENCE public.wishlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.wishlist_id_seq;
       public          postgres    false    219            '           0    0    wishlist_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.wishlist_id_seq OWNED BY public.wishlist.id;
          public          postgres    false    218            x           2604    16569    movie id    DEFAULT     d   ALTER TABLE ONLY public.movie ALTER COLUMN id SET DEFAULT nextval('public.movie_id_seq'::regclass);
 7   ALTER TABLE public.movie ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    221    220    221            t           2604    16520    user id    DEFAULT     e   ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 8   ALTER TABLE public."user" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    215    214    215            v           2604    16544    watchedlist id    DEFAULT     p   ALTER TABLE ONLY public.watchedlist ALTER COLUMN id SET DEFAULT nextval('public.watchedlist_id_seq'::regclass);
 =   ALTER TABLE public.watchedlist ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    216    217    217            w           2604    16557    wishlist id    DEFAULT     j   ALTER TABLE ONLY public.wishlist ALTER COLUMN id SET DEFAULT nextval('public.wishlist_id_seq'::regclass);
 :   ALTER TABLE public.wishlist ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    218    219    219                      0    16566    movie 
   TABLE DATA           }   COPY public.movie (id, tmdb_id, title, overview, release_date, runtime, rating, vote_count, poster_path, genres) FROM stdin;
    public          postgres    false    221   2(                 0    16517    user 
   TABLE DATA           W   COPY public."user" (id, first_name, last_name, email, password, user_type) FROM stdin;
    public          postgres    false    215   O(                 0    16541    watchedlist 
   TABLE DATA           J   COPY public.watchedlist (id, tmdb_id, title, rating, user_id) FROM stdin;
    public          postgres    false    217   �(                 0    16554    wishlist 
   TABLE DATA           ?   COPY public.wishlist (id, tmdb_id, title, user_id) FROM stdin;
    public          postgres    false    219   �(       (           0    0    movie_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.movie_id_seq', 1, false);
          public          postgres    false    220            )           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 1, true);
          public          postgres    false    214            *           0    0    watchedlist_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.watchedlist_id_seq', 1, false);
          public          postgres    false    216            +           0    0    wishlist_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.wishlist_id_seq', 1, false);
          public          postgres    false    218            �           2606    16573    movie movie_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.movie
    ADD CONSTRAINT movie_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.movie DROP CONSTRAINT movie_pkey;
       public            postgres    false    221            �           2606    16575    movie movie_tmdb_id_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.movie
    ADD CONSTRAINT movie_tmdb_id_key UNIQUE (tmdb_id);
 A   ALTER TABLE ONLY public.movie DROP CONSTRAINT movie_tmdb_id_key;
       public            postgres    false    221            {           2606    16527    user users_email_key 
   CONSTRAINT     R   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT users_email_key UNIQUE (email);
 @   ALTER TABLE ONLY public."user" DROP CONSTRAINT users_email_key;
       public            postgres    false    215            }           2606    16525    user users_pkey 
   CONSTRAINT     O   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 ;   ALTER TABLE ONLY public."user" DROP CONSTRAINT users_pkey;
       public            postgres    false    215                       2606    16547    watchedlist watchedlist_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.watchedlist
    ADD CONSTRAINT watchedlist_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.watchedlist DROP CONSTRAINT watchedlist_pkey;
       public            postgres    false    217            �           2606    16559    wishlist wishlist_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.wishlist DROP CONSTRAINT wishlist_pkey;
       public            postgres    false    219            �           2606    16548 $   watchedlist watchedlist_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.watchedlist
    ADD CONSTRAINT watchedlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);
 N   ALTER TABLE ONLY public.watchedlist DROP CONSTRAINT watchedlist_user_id_fkey;
       public          postgres    false    215    217    3197            �           2606    16560    wishlist wishlist_user_id_fkey    FK CONSTRAINT     ~   ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);
 H   ALTER TABLE ONLY public.wishlist DROP CONSTRAINT wishlist_user_id_fkey;
       public          postgres    false    3197    215    219                  x������ � �         ?   x�3��M�H��N�IM��̭J422q�I��L��KM)���,()J��04�LL�������� �*            x������ � �            x������ � �     