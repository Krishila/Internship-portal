import React, { useEffect, useState } from 'react';
import axios from 'axios';

function EmployerPostedJobs() {

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const user = JSON.parse(
    localStorage.getItem('user') || 'null'
  );

  const userId = user?.id;


  useEffect(() => {
    fetchPostedInternships();
  }, []);


  const fetchPostedInternships = async () => {

    try {

      setLoading(true);
      setError('');


      const response = await axios.get(
        'http://localhost:5000/api/internships',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data = Array.isArray(response.data)
        ? response.data
        : response.data.internships || [];


      // Employer ले post गरेको मात्र
      const myInternships = data.filter(
        (internship) =>
          Number(internship.posted_by) ===
          Number(userId)
      );


      setInternships(myInternships);

    } catch (err) {

      console.error(
        'Error fetching posted internships:',
        err
      );


      setError(
        err.response?.data?.message ||
        'Failed to load posted internships.'
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="container py-4">


      {/* HEADER */}

      <div className="mb-4">

        <h1 className="fw-bold">
          Employer Dashboard
        </h1>

        <p className="text-muted">
          Manage your posted internship opportunities.
        </p>

      </div>


      {/* LOADING */}

      {loading && (

        <div className="text-center py-5">

          <p className="text-muted">
            Loading your posted internships...
          </p>

        </div>

      )}


      {/* ERROR */}

      {!loading && error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      {/* NO POSTED JOB */}

      {!loading &&
        !error &&
        internships.length === 0 && (

          <div className="card shadow-sm">

            <div className="card-body text-center py-5">

              <h4 className="fw-bold">
                No Internships Posted
              </h4>

              <p className="text-muted mb-0">
                You have not posted any internship
                opportunities yet.
              </p>

            </div>

          </div>

      )}


      {/* POSTED JOBS */}

      {!loading &&
        !error &&
        internships.length > 0 && (

          <>

            <div className="d-flex justify-content-between align-items-center mb-3">

              <div>

                <h3 className="fw-bold mb-1">
                  Your Posted Internships
                </h3>

                <p className="text-muted mb-0">
                  Total: {internships.length}
                </p>

              </div>

            </div>


            <div className="row g-4">

              {internships.map((internship) => (

                <div
                  className="col-md-6 col-lg-4"
                  key={internship.id}
                >

                  <div className="card h-100 shadow-sm">

                    <div className="card-body">

                      <h5 className="fw-bold">
                        {internship.title}
                      </h5>


                      <p className="mb-2">

                        <strong>
                          Company:
                        </strong>{' '}

                        {internship.company ||
                          'N/A'}

                      </p>


                      <p className="mb-2">

                        <strong>
                          Location:
                        </strong>{' '}

                        {internship.location ||
                          'N/A'}

                      </p>


                      <p className="mb-2">

                        <strong>
                          Stipend:
                        </strong>{' '}

                        {internship.stipend ||
                          'N/A'}

                      </p>


                      <p className="mb-2">

                        <strong>
                          Deadline:
                        </strong>{' '}

                        {internship.deadline
                          ? new Date(
                              internship.deadline
                            ).toLocaleDateString()
                          : 'N/A'}

                      </p>


                      <p className="mb-0">

                        <strong>
                          Status:
                        </strong>{' '}


                        {Number(
                          internship.is_approved
                        ) === 1 ? (

                          <span className="badge bg-success">
                            Approved
                          </span>

                        ) : (

                          <span className="badge bg-warning text-dark">
                            Pending
                          </span>

                        )}

                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </>

      )}

    </div>
  );
}


export default EmployerPostedJobs;