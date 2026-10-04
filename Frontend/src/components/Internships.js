import React, {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import axios from "axios";
import "./Internships.css";

const API_URL = "http://localhost:5000/api/internships";


/* =====================================================
   TODAY
===================================================== */

const getToday = () => {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


/* =====================================================
   STORED USER
===================================================== */

const getStoredUser = () => {

    try {

        return JSON.parse(
            localStorage.getItem("user") || "{}"
        );

    } catch {

        return {};

    }

};


/* =====================================================
   INITIAL FORM
===================================================== */

const initialForm = {

    title: "",
    company: "",
    location: "",
    description: "",
    stipend: "",
    deadline: "",
    education_requirement: "",
    required_skills: "",
    minimum_gpa: "",
    experience_requirement: ""

};


/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function Internships({
    onApplyClick
}) {

    const [internships, setInternships] =
        useState([]);

    const [formData, setFormData] =
        useState(initialForm);

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [messageType, setMessageType] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [locationFilter, setLocationFilter] =
        useState("");

    const [companyFilter, setCompanyFilter] =
        useState("");

    const [sortBy, setSortBy] =
        useState("deadline");


    /* =====================================================
       CURRENT TIME

       This updates every 30 seconds.
       Therefore deadline status changes automatically
       without refreshing the page.
    ===================================================== */

    const [currentTime, setCurrentTime] =
        useState(new Date());


    useEffect(() => {

        const interval = setInterval(() => {

            setCurrentTime(new Date());

        }, 30000);

        return () => {

            clearInterval(interval);

        };

    }, []);


    /* =====================================================
       USER
    ===================================================== */

    const token =
        localStorage.getItem("token");

    const user =
        getStoredUser();

    const userRole =
        String(
            user?.role || ""
        ).toLowerCase();

    const isStudent =
        userRole === "student";

    const isAuthorizedToPost =
        userRole === "admin" ||
        userRole === "employer";

    const today =
        getToday();


    /* =====================================================
       FETCH INTERNSHIPS
    ===================================================== */

    const fetchInternships =
        useCallback(async () => {

            try {

                setLoading(true);

                const response =
                    await axios.get(
                        API_URL,
                        {
                            headers: token
                                ? {
                                      Authorization:
                                          `Bearer ${token}`
                                  }
                                : {}
                        }
                    );

                setInternships(

                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : response.data?.internships || []

                );

            } catch (error) {

                console.error(
                    "Failed to load internships:",
                    error
                );

                setMessage(

                    error.response?.data?.message ||
                        "Unable to load internships."

                );

                setMessageType(
                    "error"
                );

            } finally {

                setLoading(false);

            }

        }, [token]);


    useEffect(() => {

        fetchInternships();

    }, [fetchInternships]);


    /* =====================================================
       FORM HANDLING
    ===================================================== */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );

    };


    const resetForm = () => {

        setFormData(
            initialForm
        );

        setMessage("");
        setMessageType("");

    };


    /* =====================================================
       POST INTERNSHIP
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setMessageType("");


        if (!token) {

            setMessage(
                "Please login before posting an internship."
            );

            setMessageType(
                "error"
            );

            return;

        }


        if (
            !formData.title.trim() ||
            !formData.company.trim() ||
            !formData.location.trim() ||
            !formData.description.trim() ||
            !formData.deadline
        ) {

            setMessage(
                "Please fill in all required fields."
            );

            setMessageType(
                "error"
            );

            return;

        }


        if (
            formData.deadline < today
        ) {

            setMessage(
                "Deadline cannot be earlier than today."
            );

            setMessageType(
                "error"
            );

            return;

        }


        try {

            setSubmitting(true);

            await axios.post(

                API_URL,

                formData,

                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }
                }

            );


            setMessage(
                "Internship posted successfully."
            );

            setMessageType(
                "success"
            );

            setFormData(
                initialForm
            );


            await fetchInternships();

        } catch (error) {

            console.error(
                "Failed to post internship:",
                error
            );

            setMessage(

                error.response?.data?.message ||
                    "Failed to post internship."

            );

            setMessageType(
                "error"
            );

        } finally {

            setSubmitting(false);

        }

    };


    /* =====================================================
       FILTER OPTIONS
    ===================================================== */

    const locations = useMemo(() => {

        return [

            ...new Set(

                internships
                    .map(
                        (item) =>
                            item.location
                    )
                    .filter(Boolean)

            )

        ].sort();

    }, [internships]);


    const companies = useMemo(() => {

        return [

            ...new Set(

                internships
                    .map(
                        (item) =>
                            item.company
                    )
                    .filter(Boolean)

            )

        ].sort();

    }, [internships]);


    /* =====================================================
       DATE HELPERS
    ===================================================== */

    const getDeadlineDate = (
        deadline
    ) => {

        if (!deadline) {
            return null;
        }


        let date;


        /*
         * Case 1:
         * Backend returns:
         *
         * 2026-10-03
         */

        if (

            typeof deadline === "string" &&

            /^\d{4}-\d{2}-\d{2}$/.test(
                deadline
            )

        ) {

            const [
                year,
                month,
                day
            ] =
                deadline
                    .split("-")
                    .map(Number);


            /*
             * Deadline remains open until
             * 11:59:59.999 PM of that day.
             */

            date = new Date(

                year,
                month - 1,
                day,

                23,
                59,
                59,
                999

            );

        }

        /*
         * Case 2:
         * Backend returns something like:
         *
         * 2026-10-03T00:00:00.000Z
         */

        else {

            const datePart =
                String(deadline)
                    .split("T")[0];


            if (

                /^\d{4}-\d{2}-\d{2}$/.test(
                    datePart
                )

            ) {

                const [
                    year,
                    month,
                    day
                ] =
                    datePart
                        .split("-")
                        .map(Number);


                date = new Date(

                    year,
                    month - 1,
                    day,

                    23,
                    59,
                    59,
                    999

                );

            }

            else {

                date =
                    new Date(
                        deadline
                    );

            }

        }


        if (

            !date ||
            Number.isNaN(
                date.getTime()
            )

        ) {

            return null;

        }


        return date;

    };


    /* =====================================================
       CHECK EXPIRED
    ===================================================== */

    const isExpired = (
        deadline
    ) => {

        const deadlineDate =
            getDeadlineDate(
                deadline
            );


        if (!deadlineDate) {

            return false;

        }


        return (

            currentTime.getTime() >
            deadlineDate.getTime()

        );

    };


    /* =====================================================
       DEADLINE STATUS
    ===================================================== */

    const getDeadlineStatus = (
        deadline
    ) => {

        if (!deadline) {

            return {

                text: "Open",

                className:
                    "status-open"

            };

        }


        const deadlineDate =
            getDeadlineDate(
                deadline
            );


        if (!deadlineDate) {

            return {

                text: "Open",

                className:
                    "status-open"

            };

        }


        const now =
            currentTime.getTime();

        const deadlineTime =
            deadlineDate.getTime();


        /* ================================================
           CLOSED
        ================================================ */

        if (
            now > deadlineTime
        ) {

            return {

                text: "Closed",

                className:
                    "status-closed"

            };

        }


        /* ================================================
           ACTIVE
        ================================================ */

        const difference =
            deadlineTime - now;


        const daysLeft =
            Math.ceil(

                difference /
                (1000 * 60 * 60 * 24)

            );


        if (
            daysLeft <= 7
        ) {

            return {

                text: "Closing Soon",

                className:
                    "status-soon"

            };

        }


        return {

            text: "Open",

            className:
                "status-open"

        };

    };


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "Not specified";

        }


        const datePart =
            String(date)
                .split("T")[0];


        let parsedDate;


        if (

            /^\d{4}-\d{2}-\d{2}$/.test(
                datePart
            )

        ) {

            const [
                year,
                month,
                day
            ] =
                datePart
                    .split("-")
                    .map(Number);


            parsedDate =
                new Date(
                    year,
                    month - 1,
                    day
                );

        }

        else {

            parsedDate =
                new Date(date);

        }


        if (

            Number.isNaN(
                parsedDate.getTime()
            )

        ) {

            return date;

        }


        return new Intl.DateTimeFormat(
            "en-US",
            {

                year: "numeric",

                month: "short",

                day: "numeric"

            }
        ).format(
            parsedDate
        );

    };


    /* =====================================================
       FILTER + SORT
    ===================================================== */

    const filteredInternships =
        useMemo(() => {

            const search =
                searchTerm
                    .trim()
                    .toLowerCase();


            const filtered =
                internships.filter(
                    (internship) => {

                        const searchableText = [

                            internship.title,

                            internship.company,

                            internship.location,

                            internship.description,

                            internship.education_requirement,

                            internship.required_skills,

                            internship.experience_requirement

                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                        const matchesSearch =
                            !search ||
                            searchableText.includes(
                                search
                            );


                        const matchesLocation =
                            !locationFilter ||
                            internship.location ===
                                locationFilter;


                        const matchesCompany =
                            !companyFilter ||
                            internship.company ===
                                companyFilter;


                        return (

                            matchesSearch &&
                            matchesLocation &&
                            matchesCompany

                        );

                    }
                );


            return [
                ...filtered
            ].sort(
                (a, b) => {

                    if (
                        sortBy === "title"
                    ) {

                        return String(
                            a.title || ""
                        ).localeCompare(

                            String(
                                b.title || ""
                            )

                        );

                    }


                    if (
                        sortBy === "company"
                    ) {

                        return String(
                            a.company || ""
                        ).localeCompare(

                            String(
                                b.company || ""
                            )

                        );

                    }


                    if (
                        sortBy === "deadline"
                    ) {

                        if (
                            !a.deadline
                        ) {
                            return 1;
                        }


                        if (
                            !b.deadline
                        ) {
                            return -1;
                        }


                        return (

                            new Date(
                                a.deadline
                            ) -

                            new Date(
                                b.deadline
                            )

                        );

                    }


                    return 0;

                }
            );

        }, [

            internships,

            searchTerm,

            locationFilter,

            companyFilter,

            sortBy

        ]);


    /* =====================================================
       STATS
    ===================================================== */

    const activeCount =
        internships.filter(
            (item) =>
                !isExpired(
                    item.deadline
                )
        ).length;


    const closedCount =
        internships.length -
        activeCount;


    /* =====================================================
       CLEAR FILTERS
    ===================================================== */

    const clearFilters = () => {

        setSearchTerm("");

        setLocationFilter("");

        setCompanyFilter("");

        setSortBy(
            "deadline"
        );

    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="internship-page">


            {/* =================================================
               PAGE HEADER
            ================================================= */}

            <section className="internship-header">

                <div>

                    <p className="internship-eyebrow">
                        INTERNSHIP PORTAL
                    </p>


                    <h1>

                        {isAuthorizedToPost

                            ? "Internship Management"

                            : "Find Your Internship"

                        }

                    </h1>


                    <p className="internship-header-text">

                        {isAuthorizedToPost

                            ? "Create and manage internship opportunities for students."

                            : "Explore available internship opportunities and find a suitable position for your career goals."

                        }

                    </p>

                </div>


                <div className="internship-header-stats">


                    <div className="header-stat">

                        <strong>
                            {
                                internships.length
                            }
                        </strong>

                        <span>
                            Total
                        </span>

                    </div>


                    <div className="header-stat">

                        <strong>
                            {
                                activeCount
                            }
                        </strong>

                        <span>
                            Open
                        </span>

                    </div>


                    <div className="header-stat">

                        <strong>
                            {
                                closedCount
                            }
                        </strong>

                        <span>
                            Closed
                        </span>

                    </div>


                </div>

            </section>


            {/* =================================================
               MESSAGE
            ================================================= */}

            {message && (

                <div
                    className={`internship-message ${
                        messageType === "success"

                            ? "message-success"

                            : "message-error"
                    }`}
                >

                    {message}

                </div>

            )}


            {/* =================================================
               POST INTERNSHIP
            ================================================= */}

            {isAuthorizedToPost && (

                <section className="post-internship-section">


                    <div className="section-heading">

                        <div>

                            <p className="section-label">
                                MANAGEMENT
                            </p>


                            <h2>
                                Post New Internship
                            </h2>


                            <p>
                                Add complete information about
                                the internship opportunity.
                            </p>

                        </div>

                    </div>


                    <form
                        className="internship-form"
                        onSubmit={
                            handleSubmit
                        }
                    >


                        {/* BASIC INFORMATION */}

                        <div className="form-section">

                            <div className="form-section-title">
                                Basic Information
                            </div>


                            <div className="form-grid">


                                <div className="form-group">

                                    <label htmlFor="title">

                                        Internship Title

                                        <span>*</span>

                                    </label>


                                    <input
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={
                                            formData.title
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Frontend Developer Intern"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="company">

                                        Company

                                        <span>*</span>

                                    </label>


                                    <input
                                        id="company"
                                        type="text"
                                        name="company"
                                        value={
                                            formData.company
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Company name"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="location">

                                        Location

                                        <span>*</span>

                                    </label>


                                    <input
                                        id="location"
                                        type="text"
                                        name="location"
                                        value={
                                            formData.location
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Kathmandu"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="stipend">

                                        Stipend

                                    </label>


                                    <input
                                        id="stipend"
                                        type="text"
                                        name="stipend"
                                        value={
                                            formData.stipend
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. NPR 10,000/month"
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="deadline">

                                        Application Deadline

                                        <span>*</span>

                                    </label>


                                    <input
                                        id="deadline"
                                        type="date"
                                        name="deadline"
                                        value={
                                            formData.deadline
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min={today}
                                        required
                                    />

                                </div>


                            </div>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="form-section">

                            <div className="form-section-title">

                                Internship Description

                            </div>


                            <div className="form-group">

                                <label htmlFor="description">

                                    Description

                                    <span>*</span>

                                </label>


                                <textarea
                                    id="description"
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Describe the internship role, responsibilities and work environment..."
                                    rows="5"
                                    maxLength="1200"
                                    required
                                />


                                <div className="character-count">

                                    {
                                        formData
                                            .description
                                            .length
                                    }

                                    /1200

                                </div>

                            </div>

                        </div>


                        {/* REQUIREMENTS */}

                        <div className="form-section">

                            <div className="form-section-title">

                                Candidate Requirements

                            </div>


                            <div className="form-grid">


                                <div className="form-group">

                                    <label htmlFor="education_requirement">

                                        Education Requirement

                                    </label>


                                    <input
                                        id="education_requirement"
                                        type="text"
                                        name="education_requirement"
                                        value={
                                            formData
                                                .education_requirement
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Bachelor's in IT"
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="minimum_gpa">

                                        Minimum GPA

                                    </label>


                                    <input
                                        id="minimum_gpa"
                                        type="number"
                                        name="minimum_gpa"
                                        value={
                                            formData
                                                .minimum_gpa
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. 2.8"
                                        min="0"
                                        max="4"
                                        step="0.1"
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="required_skills">

                                        Required Skills

                                    </label>


                                    <input
                                        id="required_skills"
                                        type="text"
                                        name="required_skills"
                                        value={
                                            formData
                                                .required_skills
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. React, MySQL, Git"
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="experience_requirement">

                                        Experience Requirement

                                    </label>


                                    <input
                                        id="experience_requirement"
                                        type="text"
                                        name="experience_requirement"
                                        value={
                                            formData
                                                .experience_requirement
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. No experience required"
                                    />

                                </div>


                            </div>

                        </div>


                        {/* FORM BUTTONS */}

                        <div className="form-actions">


                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={
                                    resetForm
                                }
                                disabled={
                                    submitting
                                }
                            >

                                Reset

                            </button>


                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={
                                    submitting
                                }
                            >

                                {submitting

                                    ? "Posting..."

                                    : "Post Internship"

                                }

                            </button>


                        </div>


                    </form>

                </section>

            )}


            {/* =================================================
               STUDENT SEARCH
            ================================================= */}

            {isStudent && (

                <section className="search-section">


                    <div className="search-heading">

                        <div>

                            <p className="section-label">

                                SEARCH OPPORTUNITIES

                            </p>


                            <h2>

                                Available Internships

                            </h2>

                        </div>


                        <p className="result-count">

                            {
                                filteredInternships.length
                            }

                            {" "}

                            opportunities found

                        </p>

                    </div>


                    <div className="filter-area">


                        <div className="filter-field search-field">

                            <label>
                                Search
                            </label>


                            <input
                                type="text"
                                value={
                                    searchTerm
                                }
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                    )
                                }
                                placeholder="Search title, company, skill..."
                            />

                        </div>


                        <div className="filter-field">

                            <label>
                                Location
                            </label>


                            <select
                                value={
                                    locationFilter
                                }
                                onChange={(e) =>
                                    setLocationFilter(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    All Locations
                                </option>


                                {locations.map(
                                    (location) => (

                                        <option
                                            key={
                                                location
                                            }
                                            value={
                                                location
                                            }
                                        >

                                            {
                                                location
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        <div className="filter-field">

                            <label>
                                Company
                            </label>


                            <select
                                value={
                                    companyFilter
                                }
                                onChange={(e) =>
                                    setCompanyFilter(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="">
                                    All Companies
                                </option>


                                {companies.map(
                                    (company) => (

                                        <option
                                            key={
                                                company
                                            }
                                            value={
                                                company
                                            }
                                        >

                                            {
                                                company
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        <div className="filter-field">

                            <label>
                                Sort By
                            </label>


                            <select
                                value={
                                    sortBy
                                }
                                onChange={(e) =>
                                    setSortBy(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="deadline">
                                    Deadline
                                </option>

                                <option value="title">
                                    Title A-Z
                                </option>

                                <option value="company">
                                    Company A-Z
                                </option>

                            </select>

                        </div>


                        <button
                            type="button"
                            className="clear-btn"
                            onClick={
                                clearFilters
                            }
                        >

                            Clear

                        </button>


                    </div>

                </section>

            )}


            {/* =================================================
               INTERNSHIP LIST
            ================================================= */}

            <section className="internship-list-section">


                {!isStudent &&
                    !isAuthorizedToPost && (

                        <div className="general-list-heading">

                            <div>

                                <p className="section-label">

                                    OPPORTUNITIES

                                </p>


                                <h2>

                                    Internship Listings

                                </h2>

                            </div>

                        </div>

                    )}


                {/* LOADING */}

                {loading ? (

                    <div className="empty-state">

                        <div className="loading-line"></div>


                        <h3>

                            Loading internships...

                        </h3>


                        <p>

                            Please wait while the available
                            opportunities are loaded.

                        </p>

                    </div>

                )


                /* NO RESULTS */

                : filteredInternships.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-state-line"></div>


                        <h3>

                            No Internships Found

                        </h3>


                        <p>

                            There are currently no internship
                            opportunities matching your search.

                        </p>


                        {isStudent && (

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={
                                    clearFilters
                                }
                            >

                                Clear Filters

                            </button>

                        )}

                    </div>

                )


                /* INTERNSHIP CARDS */

                : (

                    <div className="internship-grid">


                        {filteredInternships.map(
                            (internship) => {


                                const deadlineStatus =
                                    getDeadlineStatus(
                                        internship.deadline
                                    );


                                const expired =
                                    isExpired(
                                        internship.deadline
                                    );


                                return (

                                    <article
                                        className="internship-card"
                                        key={

                                            internship.id ||

                                            internship._id ||

                                            `${internship.title}-${internship.company}`

                                        }
                                    >


                                        {/* CARD TOP */}

                                        <div className="card-top">

                                            <div>


                                                <p className="card-company">

                                                    {
                                                        internship.company ||
                                                        "Company"
                                                    }

                                                </p>


                                                <h3 className="card-title">

                                                    {
                                                        internship.title ||
                                                        "Internship Position"
                                                    }

                                                </h3>


                                            </div>


                                            <span
                                                className={`deadline-status ${deadlineStatus.className}`}
                                            >

                                                {
                                                    deadlineStatus.text
                                                }

                                            </span>


                                        </div>


                                        {/* CARD DETAILS */}

                                        <div className="card-details">


                                            <div className="detail-item">

                                                <span className="detail-label">

                                                    Location

                                                </span>


                                                <strong>

                                                    {
                                                        internship.location ||
                                                        "Not specified"
                                                    }

                                                </strong>

                                            </div>


                                            <div className="detail-item">

                                                <span className="detail-label">

                                                    Stipend

                                                </span>


                                                <strong>

                                                    {
                                                        internship.stipend ||
                                                        "Not specified"
                                                    }

                                                </strong>

                                            </div>


                                            <div className="detail-item">

                                                <span className="detail-label">

                                                    Deadline

                                                </span>


                                                <strong>

                                                    {
                                                        formatDate(
                                                            internship.deadline
                                                        )
                                                    }

                                                </strong>

                                            </div>


                                        </div>


                                        {/* DESCRIPTION */}

                                        <div className="card-description">

                                            <p>

                                                {
                                                    internship.description ||

                                                    "No description provided."
                                                }

                                            </p>

                                        </div>


                                        {/* REQUIREMENTS */}

                                        <div className="requirements-area">

                                            <p className="requirements-heading">

                                                Requirements

                                            </p>


                                            <div className="requirements-list">


                                                {internship.education_requirement && (

                                                    <span>

                                                        {
                                                            internship.education_requirement
                                                        }

                                                    </span>

                                                )}


                                                {internship.minimum_gpa && (

                                                    <span>

                                                        GPA{" "}

                                                        {
                                                            internship.minimum_gpa
                                                        }

                                                        +

                                                    </span>

                                                )}


                                                {internship.required_skills && (

                                                    <span>

                                                        {
                                                            internship.required_skills
                                                        }

                                                    </span>

                                                )}


                                                {internship.experience_requirement && (

                                                    <span>

                                                        {
                                                            internship.experience_requirement
                                                        }

                                                    </span>

                                                )}


                                                {!internship.education_requirement &&

                                                    !internship.minimum_gpa &&

                                                    !internship.required_skills &&

                                                    !internship.experience_requirement && (

                                                        <span>

                                                            Requirements
                                                            not specified

                                                        </span>

                                                    )}

                                            </div>

                                        </div>


                                        {/* CARD FOOTER */}

                                        <div className="card-footer">


                                            <div className="deadline-text">

                                                {expired

                                                    ? "Applications are closed"

                                                    : internship.deadline

                                                    ? `Apply before ${formatDate(
                                                          internship.deadline
                                                      )}`

                                                    : "Applications currently open"

                                                }

                                            </div>


                                            {isStudent && (

                                                <button
                                                    type="button"
                                                    className={`apply-btn ${
                                                        expired
                                                            ? "apply-disabled"
                                                            : ""
                                                    }`}
                                                    disabled={
                                                        expired
                                                    }
                                                    onClick={() => {

                                                        if (

                                                            !expired &&

                                                            typeof onApplyClick ===
                                                                "function"

                                                        ) {

                                                            onApplyClick(
                                                                internship
                                                            );

                                                        }

                                                    }}
                                                >

                                                    {expired

                                                        ? "Closed"

                                                        : "Apply Now"

                                                    }

                                                </button>

                                            )}


                                        </div>


                                    </article>

                                );

                            }

                        )}

                    </div>

                )}

            </section>

        </div>

    );

}